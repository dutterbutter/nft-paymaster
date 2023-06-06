import { utils, Provider, Wallet } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load wallet private key from env file
const INFINITY_COLLECTION_ADDRESS = "0x7CDBF2F07F4204Be589888bD480f3761AAE00061";
const PAYMASTER = "0x90409ccb313dFF7F98B595A65DEa16be4AC25c8D";
const GREETER = "0x9Ac98F32551B089aC8cDBE3113c02C47aee91dA3";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider("https://testnet.era.zksync.dev");

  // The wallet that will deploy the token and the paymaster
  // It is assumed that this wallet already has sufficient funds on zkSync
  const wallet = new Wallet(PRIVATE_KEY);

  const deployer = new Deployer(hre, wallet);

  // Deploying the paymaster
  const paymasterArtifact = await deployer.loadArtifact("StarkIndustries");
  const paymaster = await deployer.deploy(paymasterArtifact, [INFINITY_COLLECTION_ADDRESS]);
  console.log(`Paymaster address: ${paymaster.address}`);

  console.log("Funding paymaster with ETH");
  // Supplying paymaster with ETH
  await (
    await deployer.zkWallet.sendTransaction({
      to: paymaster.address,
      value: ethers.utils.parseEther("0.06"),
    })
  ).wait();

  let paymasterBalance = await provider.getBalance(paymaster.address);
  console.log(`Paymaster ETH balance is now ${paymasterBalance.toString()}`);


  console.log(`Done!`);
}
