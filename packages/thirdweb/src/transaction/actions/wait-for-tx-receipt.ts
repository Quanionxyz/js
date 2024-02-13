import type { Hex, TransactionReceipt } from "viem";
import type { TransactionOrUserOpHash } from "../types.js";
import { getChainIdFromChain } from "../../chain/index.js";
import {
  eth_getTransactionReceipt,
  getRpcClient,
  watchBlockNumber,
} from "../../rpc/index.js";
import type { PreparedTransaction } from "../prepare-transaction.js";

const MAX_BLOCKS_WAIT_TIME = 10;

const map = new Map<string, Promise<TransactionReceipt>>();

export type WaitForReceiptOptions = TransactionOrUserOpHash & {
  transaction: PreparedTransaction;
};

/**
 * Waits for the transaction receipt of a given transaction hash on a specific contract.
 * @param options - The options for waiting for the receipt.
 * @returns A promise that resolves with the transaction receipt.
 * @transaction
 * @example
 * ```ts
 * import { waitForReceipt } from "thirdweb";
 * const receipt = await waitForReceipt({
 *   contract: myContract,
 *   transactionHash: "0x123...",
 * });
 * ```
 */
export function waitForReceipt(
  options: WaitForReceiptOptions,
): Promise<TransactionReceipt> {
  const { transactionHash, userOpHash, transaction } = options;
  const prefix = transactionHash ? "tx_" : "userOp_";
  const chainId = getChainIdFromChain(transaction.chain);
  const key = `${chainId}:${prefix}${transactionHash || userOpHash}`;

  if (map.has(key)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return map.get(key)!;
  }
  const promise = new Promise<TransactionReceipt>((resolve, reject) => {
    // TODO: handle useropHash
    if (!transactionHash) {
      reject(
        new Error("Transaction has no txHash to wait for, did you execute it?"),
      );
    }

    const request = getRpcClient(transaction);

    // start at -1 because the first block doesn't count
    let blocksWaited = -1;

    const unwatch = watchBlockNumber({
      client: transaction.client,
      chain: transaction.chain,
      onNewBlockNumber: async () => {
        blocksWaited++;
        if (blocksWaited >= MAX_BLOCKS_WAIT_TIME) {
          unwatch();
          reject(new Error("Transaction not found after 10 blocks"));
        }
        try {
          const receipt = await eth_getTransactionReceipt(request, {
            hash: transactionHash as Hex,
          });

          // stop the polling
          unwatch();
          // resolve the top level promise with the receipt
          resolve(receipt);
        } catch {
          // noop, we'll try again on the next blocks
        }
      },
    });
    // remove the promise from the map when it's done (one way or the other)
  }).finally(() => {
    map.delete(key);
  });

  map.set(key, promise);
  return promise;
}
