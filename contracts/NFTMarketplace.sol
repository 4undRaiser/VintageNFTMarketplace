// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";






contract NFTMarketplace {

    using SafeMath for uint256;
    uint256 public listingLength = 0;


struct NFTListing {  
  IERC721 nft;
  uint256 price;
  address seller;
  bool sold;
  uint256 tokenId;
}
  
 
  mapping(uint256 => NFTListing) private _listings;

  

  function listNFT(IERC721 _nft,  uint256 _price, uint256 _tokenId) public {
    require(_price > 0, "NFTMarket: price must be greater than 0");
      listingLength ++;
    _nft.transferFrom(msg.sender, address(this), _tokenId);
    _listings[listingLength] = NFTListing(_nft, _price, msg.sender, false, _tokenId);
  }

  function buyNFT(uint256 _tokenId) external payable {
     NFTListing storage listing = _listings[_tokenId];
      require(!listing.sold, "item is already sold");
     require(listing.price > 0, "NFTMarket: nft not listed for sale");
     require(msg.value == listing.price, "NFTMarket: incorrect price");
     ERC721(address(this)).transferFrom(address(this), msg.sender, listing.tokenId);
     payable(listing.seller).transfer(listing.price);
      listing.sold = true;
  }


    function getNFTListing(uint256 _tokenId) public view returns (NFTListing memory) {
        return _listings[_tokenId];
    }

    
    // get list of items
    function getListinglength() public view returns (uint256) {
        return listingLength;
    }
}
