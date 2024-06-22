import type { Chain } from "../src/types";
export default {
  "chain": "Syndicate",
  "chainId": 5100,
  "explorers": [],
  "faucets": [],
  "infoURL": "https://syndicate.io",
  "name": "Syndicate Testnet",
  "nativeCurrency": {
    "name": "S-Ether",
    "symbol": "ETH",
    "decimals": 18
  },
  "networkId": 5100,
  "rpc": [
    "https://5100.rpc.thirdweb.com/${THIRDWEB_API_KEY}",
    "https://rpc-testnet.syndicate.io"
  ],
  "shortName": "syndicate-chain-testnet",
  "slug": "syndicate-testnet",
  "status": "incubating",
  "testnet": true,
  "title": "Syndicate Testnet"
} as const satisfies Chain;