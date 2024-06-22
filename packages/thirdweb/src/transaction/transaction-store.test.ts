import { describe, expect, it, vi } from "vitest";
import { ANVIL_CHAIN } from "../../test/src/chains.js";
import { TEST_CLIENT } from "../../test/src/test-clients.js";
import { TEST_ACCOUNT_A } from "../../test/src/test-wallets.js";
import { stringify } from "../utils/json.js";
import * as WaitForReceipt from "./actions/wait-for-tx-receipt.js";
import {
  addTransactionToSession,
  getSessionTransactions,
} from "./transaction-store.js";
import type { TransactionReceipt } from "./types.js";

const MOCK_TX_HASH = "0x1234567890abcdef";
const MOCK_SUCCESS_RECEIPT: TransactionReceipt = {
  transactionHash: MOCK_TX_HASH,
  blockNumber: 1234n,
  status: "success",
  blockHash: "0xabcdef1234567890",
  contractAddress: "0x1234567890abcdef",
  cumulativeGasUsed: 123456n,
  from: "0xabcdef1234567890",
  gasUsed: 123456n,
  logs: [],
  logsBloom: "0xabcdef1234567890",
  to: "0x1234567890abcdef",
  transactionIndex: 1234,
  effectiveGasPrice: 123456n,
  type: "legacy",
  root: "0xabcdef1234567890",
  blobGasPrice: 123456n,
  blobGasUsed: 123456n,
};

const waitForReceipt = vi.spyOn(WaitForReceipt, "waitForReceipt");

describe("transaction-store", () => {
  it("should return no transactions initially", async () => {
    const transactions = await getSessionTransactions(TEST_ACCOUNT_A);
    expect(transactions).toEqual([]);
  });

  it("should store pending transaction", async () => {
    waitForReceipt.mockImplementationOnce(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });

      return MOCK_SUCCESS_RECEIPT;
    });

    await addTransactionToSession({
      account: TEST_ACCOUNT_A,
      transactionHash: MOCK_TX_HASH,
      client: TEST_CLIENT,
      chain: ANVIL_CHAIN,
    });

    const transactions = await getSessionTransactions(TEST_ACCOUNT_A);
    expect(transactions).toEqual([
      { transactionHash: MOCK_TX_HASH, status: "PENDING" },
    ]);
  });

  it("should update transactions on completion", async () => {
    waitForReceipt.mockResolvedValueOnce(MOCK_SUCCESS_RECEIPT);

    await addTransactionToSession({
      account: TEST_ACCOUNT_A,
      transactionHash: MOCK_TX_HASH,
      client: TEST_CLIENT,
      chain: ANVIL_CHAIN,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });

    const transactions = await getSessionTransactions(TEST_ACCOUNT_A);
    expect(transactions).toEqual([
      JSON.parse(
        stringify({
          transactionHash: MOCK_TX_HASH,
          status: "CONFIRMED",
          receipt: MOCK_SUCCESS_RECEIPT,
        }),
      ),
    ]);
  });
});
