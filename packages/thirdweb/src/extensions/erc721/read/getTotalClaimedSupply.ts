import type { BaseTransactionOptions } from "../../../transaction/types.js";
import { nextTokenIdToClaim } from "../__generated__/IDrop/read/nextTokenIdToClaim.js";
import { totalMinted } from "../__generated__/ISignatureDropERC721/read/totalMinted.js";

/**
 * Retrieves the total claimed supply of ERC721 tokens.
 * @param options - The base transaction options.
 * @returns A promise that resolves to the total claimed supply as a bigint.
 * @throws An error if the total claimed supply cannot be retrieved.
 * @example
 *
 * ```ts
 * import { getTotalClaimedSupply } from "thirdweb/extensions/erc721";
 *
 * const totalClaimedSupply = await getTotalClaimedSupply({
 *  contract,
 * });
 * ```
 */
export async function getTotalClaimedSupply(
  options: BaseTransactionOptions,
): Promise<bigint> {
  const results = await Promise.allSettled([
    totalMinted(options),
    nextTokenIdToClaim(options),
  ]);
  for (const result of results) {
    if (result.status === "fulfilled") {
      return result.value;
    }
  }
  throw new Error("Failed to get total claimed supply");
}
