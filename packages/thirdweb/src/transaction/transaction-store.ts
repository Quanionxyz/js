import type { Chain } from "../chains/types.js";
import type { ThirdwebClient } from "../client/client.js";
import type { Hex } from "../utils/encoding/hex.js";
import { stringify } from "../utils/json.js";
import { LocalStorage } from "../wallets/in-app/web/utils/Storage/LocalStorage.js";
import type { Account } from "../wallets/interfaces/wallet.js";
import { waitForReceipt } from "./actions/wait-for-tx-receipt.js";
import type { TransactionReceipt } from "./types.js";

type StoredTransaction = {
  transactionHash: Hex;
  status: "PENDING" | "CONFIRMED";
  receipt?: TransactionReceipt;
};

let storage: LocalStorage | undefined;

/**
 * Retrieve transactions for the given account for the current session. Sessions are stored in local storage when possible, with memory as a fallback.
 * @param account {Account} - The account to retrieve transactions for.
 * @returns {StoredTransaction[]} An array of stored pending and confirmed transactions.
 */
export async function getSessionTransactions(
  account: Account,
): Promise<StoredTransaction[]> {
  // No transactions if the store hasn't been initialized yet.
  if (!storage) {
    return [];
  }

  const transactionStore = await getTransactionsFromStorage(storage);
  return transactionStore[account.address] ?? [];
}

/**
 * @internal
 */
export async function addTransactionToSession(options: {
  account: Account;
  transactionHash: Hex;
  client: ThirdwebClient;
  chain: Chain;
}) {
  const { account, transactionHash, client, chain } = options;
  storage =
    storage ??
    new LocalStorage({
      clientId: client.clientId,
    });
  // Definitely typed storage
  const _storage = storage;

  const transactionStore = await getTransactionsFromStorage(_storage);
  const transactionsForAccount = transactionStore[account.address];
  transactionStore[account.address] = [
    ...(transactionsForAccount ?? []),
    { transactionHash: transactionHash, status: "PENDING" },
  ];
  await setTransactionsInStorage(_storage, transactionStore);

  waitForReceipt({
    transactionHash,
    chain,
    client,
  }).then(async (receipt) => {
    const newTransaction = {
      transactionHash: receipt.transactionHash,
      status: "CONFIRMED" as const,
      receipt,
    };

    const transactionStore = await getTransactionsFromStorage(_storage);
    const transactionsForAccount =
      transactionStore[account.address]?.filter(
        (tx) => tx.transactionHash !== transactionHash,
      ) ?? [];
    transactionStore[account.address] = [
      ...(transactionsForAccount ?? []),
      newTransaction,
    ];

    setTransactionsInStorage(_storage, transactionStore);
  });
}

async function getTransactionsFromStorage(
  storage: LocalStorage,
): Promise<Record<string, StoredTransaction[]>> {
  const stringifiedTransactions = await storage.getSessionTransactions();
  if (stringifiedTransactions === null) {
    return {};
  }

  return JSON.parse(stringifiedTransactions) as Record<
    string,
    StoredTransaction[]
  >;
}

async function setTransactionsInStorage(
  storage: LocalStorage,
  transactionStore: Record<string, StoredTransaction[]>,
): Promise<void> {
  const stringifiedTransactions = stringify(transactionStore);
  return storage.saveSessionTransactions(stringifiedTransactions);
}
