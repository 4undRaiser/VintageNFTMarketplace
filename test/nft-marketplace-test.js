const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyNFT", function () {
  this.timeout(50000);

  let myNFT;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
 
    [owner, acc1, acc2] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
  });

 

  const contractErrors = {
    zeroPrice: "Price must be greater than zero",
    alreadySold: "item already sold",
    insufficientEther: "not enough ether to cover item price and market fee",
  };

  const newMarketPlaceItem = async (
    tokenURI = "dummyURI",
    tokenId = 0,
    tokenPrice = 10
  ) => {
    const tx1 = await myNFT.connect(acc1).createNFT(tokenURI);
    await tx1.wait();

    const tx2 = await myNFT
      .connect(acc1)
      .approve(nftMarketplace.address, tokenId);
    await tx2.wait();

    const tx3 = await nftMarketplace
      .connect(acc1)
      .listNFT(myNFT.address, tokenId, tokenPrice);
    return await tx3.wait();
  };

  const purchaseItem = async (buyer, itemId, price) => {
    const tx = await nftMarketplace.connect(buyer).buyNFT(itemId, {
      value: price,
    });
    return await tx.wait();
  };

  /**
   * Test helpers end
   */

  describe("makeItem", () => {
    it("should transfer token ownership to marketplace", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 10;

      await newMarketPlaceItem(tokenURI, tokenId, tokenPrice);

      expect(await myNFT.ownerOf(tokenId)).to.equal(nftMarketplace.address);
    });

    it("should create new marketplace item", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 10;

      const itemCount = 1;
      expect(await newMarketPlaceItem(tokenURI, tokenId, tokenPrice))
        .to.emit("Offered")
        .withArgs(itemCount, myNFT.address, tokenId, tokenPrice, acc1.address);

      const listing = await nftMarketplace.getNFTListing(itemCount);
      expect(listing.price).to.equal(tokenPrice);
      expect(listing.seller).to.equal(acc1.address);
    });

    it("should fail to list item with zero price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 0;

      await expect(
        newMarketPlaceItem(tokenURI, tokenId, tokenPrice)
      ).to.be.revertedWith(contractErrors.zeroPrice);
    });
  });

  describe("buyNFT", () => {
    it("should pay seller on successful purchase", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 10;

      await newMarketPlaceItem(tokenURI, tokenId, tokenPrice);

      const itemCount = 1;

      const initialSellerBalance = await ethers.provider.getBalance(
        acc1.address
      );
      await buyNFT(acc2, itemCount, tokenPrice);
      const newSellerBalance = await ethers.provider.getBalance(acc1.address);
      expect(newSellerBalance).to.equal(initialSellerBalance.add(tokenPrice));
    });

    it("should transfer token ownership to buyer", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 10;

      await newMarketPlaceItem(tokenURI, tokenId, tokenPrice);

      const itemCount = 1;

      await buyNFT(acc2, itemCount, tokenPrice);
      expect(await myNFT.ownerOf(tokenId)).to.equal(acc2.address);
    });

    it("should fail to buy already sold item", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 10;

      await newMarketPlaceItem(tokenURI, tokenId, tokenPrice);

      const itemCount = 1;

      await buyNFT(acc2, itemCount, tokenPrice);

      await expect(
        buyNFT(acc2, itemCount, tokenPrice)
      ).to.be.revertedWith(contractErrors.alreadySold);
    });

    it("should fail to buy item without paying item price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = 10;

      await newMarketPlaceItem(tokenURI, tokenId, tokenPrice);

      const itemCount = 1;

      await expect(buyNFT(acc2, itemCount, 0)).to.be.revertedWith(
        contractErrors.insufficientEther
      );
    });
  });
});
