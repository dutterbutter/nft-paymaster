// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InfinityStones is ERC721URIStorage, Ownable {
    uint256 public tokenId;

    constructor() ERC721("InfinityStones", "ISTN") {
        _mintStone("Space Stone");
        _mintStone("Mind Stone");
        _mintStone("Reality Stone");
        _mintStone("Power Stone");
        _mintStone("Time Stone");
        _mintStone("Soul Stone");
    }

    function _mintStone(string memory stoneName) private {
        _safeMint(msg.sender, tokenId);

        // Construct the URI for this stone
        string memory baseURI = "./metadata/";
        string memory tokenURI = string(abi.encodePacked(baseURI, stoneName, ".json"));

        _setTokenURI(tokenId, stoneName);
        tokenId++;
    }

    function mint(address recipient, string memory tokenURI) public onlyOwner {
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenId++;
    }
}
