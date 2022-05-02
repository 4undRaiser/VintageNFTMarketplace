// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";






contract NFTMarketplace is Ownable {

    using SafeMath for uint256;
    uint256 public listingLength = 0;


struct NFTListing {
  IERC721 nft;
  uint256 price;
  address seller;
  bool sold;
}
  
 
  mapping(uint256 => NFTListing) private _listings;

  

  function listNFT(IERC721 _nft, uint256 tokenID, uint256 price) public {
    require(price > 0, "NFTMarket: price must be greater than 0");
      listingLength ++;
    _nft.transferFrom(msg.sender, address(this), tokenID);
    _listings[tokenID] = NFTListing(_nft, price, msg.sender, false);
  
    
  }

  function buyNFT(uint256 tokenID) public payable {
     NFTListing memory listing = _listings[tokenID];
      require(!listing.sold, "item already sold");
     require(listing.price > 0, "NFTMarket: nft not listed for sale");
     require(msg.value == listing.price, "NFTMarket: incorrect price");
     ERC721(address(this)).transferFrom(address(this), msg.sender, tokenID);
     payable(listing.seller).transfer(listing.price.mul(95).div(100));
      listing.sold = true;
  }


    function getNFTListing(uint256 _tokenID) public view returns (NFTListing memory) {
        return _listings[_tokenID];
    }

    
    // get list of items
    function getListinglength() public view returns (uint256) {
        return listingLength;
    }
}
