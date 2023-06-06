import { HardhatUserConfig } from "hardhat/config";

require("@nomiclabs/hardhat-ethers");

import "@matterlabs/hardhat-zksync-deploy";
import "@matterlabs/hardhat-zksync-solc";
import "@matterlabs/hardhat-zksync-verify";
import "@nomiclabs/hardhat-waffle";

// dynamically changes endpoints for local tests
const zkSyncTestnet =
  process.env.NODE_ENV == "test"
    ? {
        url: "http://localhost:3050",
        ethNetwork: "http://localhost:8545",
        zksync: true,
      }
    : {
        url: "https://zksync2-testnet.zksync.dev",
        ethNetwork: "Goerli",
        zksync: true,
        verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
      };

const config: HardhatUserConfig = {
  zksolc: {
    version: "1.3.10",
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: "zkSyncTestnet", // change to hardhat for local testing
  networks: {
    hardhat: {
      zksync: false,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    },
    zkSyncTestnet,
  },
  solidity: {
    version: "0.8.17",
  },
};

export default config;
