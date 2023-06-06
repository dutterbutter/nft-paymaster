import { Wallet, utils } from "zksync-web3";
import * as ethers from "ethers";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// load env file
import dotenv from "dotenv";
dotenv.config();

// load wallet private key from env file
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";
// Primarily for testing purposes, we will mint the NFTs to this address
const RECIPIENT_ADDRESS = "0xf0e0d7709a335C2DD712F4F0F907017886B26707"

if (!PRIVATE_KEY)
  throw "⛔️ Private key not detected! Add it to the .env file!";

// An example of a deploy script that will deploy and call a simple contract.
export default async function (hre: HardhatRuntimeEnvironment) {
  console.log(`Running deploy script for the Infinity Stones NFT contract`);

  // Initialize the wallet.
  const wallet = new Wallet(PRIVATE_KEY);

  // Create deployer object and load the artifact of the contract you want to deploy.
  const deployer = new Deployer(hre, wallet);
  const artifact = await deployer.loadArtifact("InfinityStones");

  // Estimate contract deployment fee
  const deploymentFee = await deployer.estimateDeployFee(artifact, []);

  // Display estimated deployment fee
  const parsedFee = ethers.utils.formatEther(deploymentFee.toString());
  console.log(`The deployment is estimated to cost ${parsedFee} ETH`);

  // Deploy the contract. The returned object will be of a `Contract` type, similarly to ones in `ethers`.
  const infinityStonesContract = await deployer.deploy(artifact);

  // Show the contract info.
  const contractAddress = infinityStonesContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // Mint two NFTs to the recipient address
  const stoneURI1 = "Space Stone";
  const stoneURI2 = "Mind Stone";
  await infinityStonesContract.mint(RECIPIENT_ADDRESS, stoneURI1);
  await infinityStonesContract.mint(RECIPIENT_ADDRESS, stoneURI2);

  // Get and log the balance of the recipient
  const balance = await infinityStonesContract.balanceOf(RECIPIENT_ADDRESS);
  console.log(`Balance of the recipient: ${balance}`);
}
