import React, { useState, useEffect } from "react";
import { Contract, Web3Provider, utils } from "zksync-web3";
import {
  GREETER_CONTRACT_ADDRESS,
  GREETER_CONTRACT_ABI,
  INFINITY_CONTRACT_ADDRESS,
  INFINITY_CONTRACT_ABI,
  PAYMASTER_CONTRACT_ADDRESS,
  ALLOWED_TOKEN,
} from "../constants/consts";
import { ethers } from "ethers";

const Home = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [NFTcontractInstance, setNFTContractInstance] = useState(null);
  const [nftBalance, setNftBalance] = useState(0);
  const [greeting, setGreeting] = useState("");
  const [newGreeting, setNewGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initEthers() {
      if (window.ethereum) {
        const provider = new Web3Provider(window.ethereum);
        setProvider(provider);

        await provider.send("eth_requestAccounts", []);

        const signerInstance = provider.getSigner();
        setSigner(signerInstance);

        const contract = new Contract(
          GREETER_CONTRACT_ADDRESS,
          GREETER_CONTRACT_ABI,
          signerInstance
        );
        setContractInstance(contract);

        const NFT_contract = new Contract(
          INFINITY_CONTRACT_ADDRESS,
          INFINITY_CONTRACT_ABI,
          signerInstance
        );
        setNFTContractInstance(NFT_contract);

        await getGreeting(contract);
        await getNftBalance();
      }
    }

    async function getGreeting(contract) {
      if (contract) {
        const greeting = await contract.greet();
        setGreeting(greeting);
        setLoading(false);
      }
    }

    async function getNftBalance() {
      if (mounted && NFTcontractInstance && signer) {
        const signerAddress = await signer.getAddress();
        const balance = await NFTcontractInstance.balanceOf(signerAddress);
        setNftBalance(balance);
      }
    }

    let mounted = true;
    initEthers();

    // Listen for accountsChanged event
    window.ethereum.on("accountsChanged", async (accounts) => {
      const provider = new Web3Provider(window.ethereum);
      setProvider(provider);

      const signerInstance = provider.getSigner();
      setSigner(signerInstance);

      const contract = new Contract(
        GREETER_CONTRACT_ADDRESS,
        GREETER_CONTRACT_ABI,
        signerInstance
      );
      setContractInstance(contract);

      const NFT_contract = new Contract(
        INFINITY_CONTRACT_ADDRESS,
        INFINITY_CONTRACT_ABI,
        signerInstance
      );
      setNFTContractInstance(NFT_contract);

      await getGreeting(contract);
      await getNftBalance();
    });
    return () => {
      mounted = false;
    };
  }, []);

  const payForGreetingChange = async () => {
    setLoading(true);

    if (NFTcontractInstance) {
      try {
        const signerAddress = await signer.getAddress();

        // Query for the balance of the current user
        const nftBalance = await NFTcontractInstance.balanceOf(signerAddress);

        if (nftBalance > 0) {
          const txHandle = await contractInstance.setGreeting(
            newGreeting,
            await payWithPayMaster()
          );
          // Wait until the transaction is committed
          const receipt = await txHandle.wait();
          // Update greeting
          const greeting = await contractInstance.greet();
          setGreeting(greeting);
          setNewGreeting("");
          setLoading(false);
        } else {
          const txHandle = await contractInstance.setGreeting(newGreeting);
          const receipt = await txHandle.wait();
          const greeting = await contractInstance.greet();
          setGreeting(greeting);
          setNewGreeting("");
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  const payWithPayMaster = async () => {
    let paymasterBalance = await provider.getBalance(
      PAYMASTER_CONTRACT_ADDRESS
    );
    const gasPrice = await provider.getGasPrice();

    // estimate gasLimit via paymaster
    const paramsForFeeEstimation = utils.getPaymasterParams(
      PAYMASTER_CONTRACT_ADDRESS,
      {
        type: "General",
        innerInput: new Uint8Array(),
      }
    );

    // estimate gasLimit via paymaster
    const gasLimit = await contractInstance.estimateGas.setGreeting(
      newGreeting,
      {
        customData: {
          gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
          paymasterParams: paramsForFeeEstimation,
        },
      }
    );
   // const fee = gasPrice.mul(gasLimit.toString());
    const paymasterParams = utils.getPaymasterParams(
      PAYMASTER_CONTRACT_ADDRESS,
      {
        type: "General",
        // empty bytes as testnet paymaster does not use innerInput
        innerInput: new Uint8Array(),
      }
    );

    return {
      maxFeePerGas: gasPrice,
      maxPriorityFeePerGas: ethers.BigNumber.from(0),
      gasLimit,
      customData: {
        gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
        paymasterParams,
      },
    };
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      {loading ? (
        <div className="flex items-center mx-auto text-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm12 0a8 8 0 018 8v-2a6 6 0 00-6-6h-2zm-8 0a4 4 0 014-4V4a8 8 0 00-8 8h4zm12 0a4 4 0 01-4 4v2a6 6 0 006-6h2z"
            ></path>
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-4">Greeter says:</h1>
          <p className="text-2xl mb-4">{greeting}👋</p>
          <p className="text-lg mb-4 mx-auto text-center max-w-xl px-4">
            This is a simple dApp, where if the user possesses one of six
            Infinity Stones they can interact with the Greeter contract and
            transaction fees are covered by Stark Industries paymaster.
          </p>

          {nftBalance > 0 && (
            <p className="text-1xl font-bold mb-4">
              You possess an Infinity Stone, with it Stark Industries pays all
              transaction fees!
            </p>
          )}

          <div className="flex items-center justify-center mb-4">
            <input
              type="text"
              placeholder="Enter new greeting"
              value={newGreeting}
              onChange={(e) => setNewGreeting(e.target.value)}
              className="border border-gray-400 mr-2 px-4 py-2 rounded-lg w-64"
            />
            <button
              onClick={() => payForGreetingChange()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Change greeting
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
