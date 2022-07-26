// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./iwhitelist.sol";

contract DevsNFT is ERC721Enumerable, Ownable {
  // baseTokenURI: computes token URI
  string baseTokenURI;

  // price: price of DevsNFT
  uint256 public price = 0.01 ether;

  // paused: for emergency contract pausing
  bool public paused;

  // maxTokenIds: maximum number of NFTs that could be minted
  uint256 public maxTokenIds = 20;

  // tokenIds: total number of NFTs minted
  uint256 public tokenIds;

  // Whitelist contract instance
  IWhitelist whitelist;

  // startTime: timestamp for when presale would start
  bool public startTime;

  // endTime: timestamp for when presale would end
  uint256 public endTime;

  modifier whenActive() {
    require(!paused, "Minting currently paused!");
    _;
  }

  constructor(string memory baseURI, address Whitelist)
    ERC721("Devs NFT", "DNFT")
  {
    baseTokenURI = baseURI;
    whitelist = IWhitelist(Whitelist);
  }

  // startPresale(): initiates presale for whitelisted addresses
  function startPresale() public onlyOwner {
    startTime = true;
    endTime = block.timestamp + 2 hours;
  }

  // mintPresale(): mint NFT for whitelisted addresses - private round
  function mintPresale() public payable whenActive {
    require(
      startTime && block.timestamp < endTime,
      "Presale not yet active, check back later"
    );
    require(
      whitelist.whitelistedAddresses(msg.sender),
      "Oops... Sorry, you did not get whitelisted"
    );
    require(
      tokenIds < maxTokenIds,
      "Oops... You came late. We are out. Maximum supply exceeded"
    );
    require(msg.value >= price, "Minting costs 0.001 ether");
    tokenIds += 1;
    _safeMint(msg.sender, tokenIds);
  }

  // mintPublic(): mint NFT for public round
  function mintPublic() public payable whenActive {
    require(
      startTime && block.timestamp >= endTime,
      "Presale Round is still running, kindly wait for the Public Round"
    );
    require(
      tokenIds < maxTokenIds,
      "Oops... You came late. We are out. Maximum supply exceeded"
    );
    require(msg.value >= price, "Minting costs 0.001 ether");
    tokenIds += 1;
    _safeMint(msg.sender, tokenIds);
  }

  // _baseURI(): overrides ERC721 implementation
  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }

  // setPaused(): toggles minting to pause and unpause
  function setPause(bool rest) public onlyOwner {
    paused = rest;
  }

  // withdraw(): withdraws & sends all ETH in contract to owner's address
  function withdraw() public onlyOwner {
    address creator = owner();
    uint256 amount = address(this).balance;
    (bool sent, ) = creator.call{ value: amount }("");
    require(sent, "Failed to transfer ether");
  }

  // receive() & fallback() standards
  receive() external payable {}

  fallback() external payable {}
}
