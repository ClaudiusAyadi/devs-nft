// 1. Import packages
const { ethers } = require("hardhat");
require("dotenv").config({ path: "env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  // 2. Whitelist.sol CA & Metadata URL
  const whitelist = WHITELIST_CONTRACT_ADDRESS;
  const metadataURL = METADATA_URL;

  // 3. Get contract instance
  const DevsNFT = await ethers.getContractFactory("DevsNFT");

  // 3. Deploy contract
  const devsNFT = await DevsNFT.deploy(metadataURL, whitelist);

  // 4. Print for aesthetics
  console.log("Deploying, please wait...");

  // 5. Wait for deployment to finish
  await devsNFT.deployed();

  // 6. Another aesthetics
  console.log("Deployed successfully!");
  console.log("devsNFT Contract Address:", devsNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
