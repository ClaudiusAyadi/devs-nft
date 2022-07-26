import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Contract, providers, utils, ethers } from "ethers";
import Web3Modal from "web3modal";
import { DEVSNFT_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnect: checks user's wallet status
  const [walletConnect, setWalletConnect] = useState(false);

  // startTime: tracks startTime contract variable
  const [startTime, setStartTime] = useState(false);

  // endTime: tracks endTime contract variable
  const [endTime, setEndTime] = useState(false);

  // confirming: tracks the button and display given text when waiting for tx to be confirmed
  const [confirming, setConfirming] = useState(false);

  // onlyOwner: tracks the onlyOwner modifier
  const [onlyOwner, setOnlyOwner] = useState(false);

  // tokenIds: tracks the tokenIds contract variable to record the number of token already minted
  const [tokenIds, setTokenIds] = useState(false);

  // web3ModalRef: initiate Web3Modal reference
  const web3ModalRef = useRef();

  // presaleMint: interacts and controls the presaleMint()
  const presaleMint = async () => {
    try {
      // set signer
      const signer = await getProviderOrSigner(true);

      // create contract instance with signer and allow update method
      const whitelist = new Contract(DEVSNFT_CONTRACT_ADDRESS, abi, signer);

      // startPresale: calls presaleMint() here to start minting for whitelisted addresses
      const startPresale = await whitelist.presaleMint({
        // parse NFT cost using utils
        value: utils.parseEther("0.001"),
      });
      setConfirming(true);
      await startPresale.wait();
      setConfirming(flase);
      window.alert("Hurray! You just minted a DEVSNFT. Welcome to the hood");
    } catch (error) {
      console.error(error);
    }
  };

  // publicMint: interacts with the mint() to initiate NFT minting - public round
  const publicMint = async () => {
    try {
      // set signer
      const signer = await getProviderOrSigner(true);
      
      // contract instance with signer
      const whitelist = new Contract(
        DEVSNFT_CONTRACT_ADDRESS,
        abi,
        signer,
      );

      // startPublic: calls the mint() to initiate public round

    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>DevsNFT Minting</title>
        <meta
          name="description"
          content="Celebrate developers with us by owning a unique DEVSNFT collection today!"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{" "}
          <code className={styles.code}>pages/index.js</code>
        </p>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Documentation &rarr;</h2>
            <p>Find in-depth information about Next.js features and API.</p>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Learn &rarr;</h2>
            <p>Learn about Next.js in an interactive course with quizzes!</p>
          </a>

          <a
            href="https://github.com/vercel/next.js/tree/canary/examples"
            className={styles.card}
          >
            <h2>Examples &rarr;</h2>
            <p>Discover and deploy boilerplate example Next.js projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h2>Deploy &rarr;</h2>
            <p>
              Instantly deploy your Next.js site to a public URL with Vercel.
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
