import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Contract, providers, utils, ethers } from "ethers";
import Web3Modal from "web3modal";
import { DEVSNFT_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnect: checks user's wallet status
  const [walletConnected, setWalletConnected] = useState(false);

  // startTime: tracks startTime contract variable
  const [startTime, setStartTime] = useState(false);

  // endTime: tracks endTime contract variable
  const [endTime, setEndTime] = useState(false);

  // confirming: tracks the button and display given text when waiting for tx to be confirmed
  const [confirming, setConfirming] = useState(false);

  // isOwner: tracks the owner()
  const [isOwner, setIsOwner] = useState(false);

  // tokenIds: tracks the tokenIds contract variable to record the number of token already minted
  const [tokenIds, setTokenIds] = useState(false);

  // web3ModalRef: initiate Web3Modal reference
  const web3ModalRef = useRef();

  // mintPresale: interacts and controls the mintPresale() in the contract
  const mintPresale = async () => {
    try {
      // set signer
      const signer = await getProviderOrSigner(true);

      // contract instance with signer and update method
      const whitelist = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, signer);

      // callPresale: calls mintPresale() from the contract to initiate minting tx for whitelisted addresses
      const callPresale = await whitelist.mintPresale({
        // parse NFT cost using utils
        value: utils.parseEther("0.01"),
      });
      setConfirming(true);
      await callPresale.wait();
      setConfirming(flase);
      window.alert("Hurray! You just minted a DEVSNFT. Welcome to the hood");
    } catch (error) {
      console.error(error);
    }
  };

  // mintPublic: interacts and controls the mintPublic() in the contract
  const mintPublic = async () => {
    try {
      // set signer
      const signer = await getProviderOrSigner(true);

      // contract instance with signer and update method
      const whitelist = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, signer);

      // callPublic: calls the mintPublic() in the contract to initiate minting tx for the public round
      const callPublic = await whitelist.mintPublic({
        // parse NFT cost using utils
        value: utils.parseEther("0.01"),
      });
      setConfirming(true);
      await callPublic.wait();
      setConfirming(flase);
      window.alert("Hurray! You just minted a DEVSNFT. Welcome to the hood");
    } catch (error) {
      console.error(error);
    }
  };

  // connectWallet: connects the user's wallet
  const connectWallet = async () => {
    try {
      // get provider - prompts for first-time user
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  // startPresale: interacts and controls the startPresale() from thr contract
  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelist = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, signer);

      // callStartPresale: calls the startPresale() from the contract
      const callStartPresale = await whitelist.startPresale();
      setConfirming(true);
      await callStartPresale.wait();
      setConfirming(false);
      await checkStartTime();
    } catch (error) {
      console.error(error);
    }
  };

  // checkStartTime: checks if presale has started
  const checkStartTime = async () => {
    try {
      //use provider since it is a read tx
      const provider = await getProviderOrSigner();
      const devsNFT = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, provider);

      // call startTime from the contract
      const startTime = await devsNFT.startTime();
      if (!startTime) {
        await getOwner();
      }

      setStartTime(startTime);
      return startTime;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // checkEndTime: checks if the presale has ended
  const checkEndTime = async () => {
    try {
      // use provider
      const provider = await getProviderOrSigner();
      const devsNFT = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, provider);

      // call endTime from the contract
      const endTime = await devsNFT.endTime();

      // remember endTime is a Big Number.
      // (date.now)/1000 gives us the current time in seconds
      const ended = endTime.lt(Math.floor(Date.now() / 1000));
      if (ended) {
        setEndTime(true);
      } else {
        setEndTime(false);
      }
      return ended;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  // getOwner: interacts and queries the  contract to retrieve the owner
  const getOwner = async () => {
    try {
      const provider = await getProviderOrSigner();
      const devsNFT = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, provider);

      // calls owner()
      const owner = await devsNFT.owner();

      // get signer
      const signer = await getProviderOrSigner(true);

      // get signer's address
      const address = await signer.getAddress();
      if (address.toLowerCase() === owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // getTokenIds: get the number of tokenIds already minted
  const getTokenIds = async () => {
    try {
      const provider = await getProviderOrSigner();
      const devsNFT = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, provider);

      // calls tokenIds from the contract
      const tokenIds = await devsNFT.tokenIds();

      // tokenIds is a BigNumber and should be converted to string
      setTokenIds(tokenIds.toString());
    } catch (error) {
      console.error(error);
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    // connect wallet using web3Modal
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new provider.Web3Provider(provider);

    // notify user if not on Rinkeby network
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 4) {
      window.alert("Switch to Rinkeby Network");
      throw new Error("Still not on Rinkeby Network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    // ensures wallet is connected
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // verify if presale has started and ended
      const startTime = checkStartTime();
      if (startTime) {
        checkEndTime();
      }

      getTokenIds();

      // set an interval to check every 5 seconds if presale has ended
      const endTimeInterval = setInterval(async function () {
        const startTime = await checkStartTime();
        if (startTime) {
          const endTime = await checkEndTime();
          if (endTime) {
            clearInterval(endTimeInterval);
          }
        }
      }, 5 * 1000);

      // set interval to get the number of tokenIds minted every 5 seconds
      setInterval(async function () {
        await getTokenIds();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  // renderButton: returns a button based on the dapp state
  const renderButton = () => {
    // verify wallet connection status
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }
  };

  // set waiting action
  if (confirming) {
    return <button className={styles.button}>Confirming... please wait</button>;
  }

  // if connected user is the owner and presale hasn't started, allow owner to start presale
  if (isOwner && !startTime) {
    return (
      <button className={styles.button} onClick={startPresale}>
        Start Presale
      </button>
    );
  }

  // if connected user isn't the owner and presale hasn't started, notify user
  if (!startTime) {
    return (
      <div>
        <div className={styles.description}>
          Presale not yet active, check back later
        </div>
      </div>
    );
  }

  // if presale has started and not yet ended, allow whitelisted addresses to mint
  if (startTime && !endTime) {
    return (
      <div>
        <div className={styles.description}>
          Hurray! Presale has started, mint your own DevsNFT now and join us on
          this journey to the future! 🥳
        </div>
        <button className={styles.button} onClick={mintPresale}>
          Private Mint Here 🚀
        </button>
      </div>
    );
  }

  // if presale has started and ended, initiate public round
  if (startTime && endTime) {
    return (
      <div>
        <div className={styles.description}>
          Hurray! Public Round has started, mint your own DevsNFT now and join
          us on this journey to the future! 🥳
        </div>
        <button className={styles.button} onClick={mintPublic}>
          Public Mint Here 🚀
        </button>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>DevsNFT Minting</title>
        <meta
          name="description"
          content="Celebrate developers with us by owning a unique DevsNFT collection today!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to DevsNFT!</h1>
          <div className={styles.description}>
            Hi! You are welcome again!
            <br />
            <br />
            This is my 3rd DApp following the [learnweb3DAO
            tracks][https://learnweb3.io]. It is the final part of our NFT
            collection DApp.
            <br />
            <br />
            This DApp was built with:
            <h2>Solidity</h2>
            <h2>React</h2>
            <h2>Next.js</h2>
          </div>
          <div className={styles.description}>
            Minted: {tokenIds}/20 DevsNFT
          </div>
          {renderButton()};
        </div>
        <div>
          <img className={styles.image} src="./devsnft/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Built with 💖 by wetNode</footer>
    </div>
  );
}
