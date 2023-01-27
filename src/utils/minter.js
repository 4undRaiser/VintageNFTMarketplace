import axios from "axios";
import MyNFTContractAddress from "../contracts/MyNFT-address.json";
import NFTMarketplaceContractAddress from "../contracts/NFTMarketplace-address.json";
import { BigNumber, ethers } from "ethers";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";

const getAccessToken = () => {
  return process.env.REACT_APP_STORAGE_API_KEY;
};
const makeStorageClient = () => {
  return new Web3Storage({ token: getAccessToken() });
};

const upload = (file) => {
  const client = makeStorageClient();
  const file_cid = client.put(file);
  return file_cid;
};

const makeFileObjects = (file, file_name) => {
  const blob = new Blob([JSON.stringify(file)], { type: "application/json" });
  const files = [new File([blob], `${file_name}.json`)];

  return files;
};

// mint an NFT
export const createNft = async (
  minterContract,
  marketplaceContract,
  performActions,
  { name, price, description, ipfsImage, ownerAddress }
) => {
  await performActions(async (kit) => {
    if (!name || !description || !ipfsImage) return;
    const { defaultAccount } = kit;

    // convert NFT metadata to JSON format
    const data = JSON.stringify({
      name,
      description,
      image: ipfsImage,
      owner: defaultAccount,
    });

    try {
      // save NFT metadata to IPFS
      const files = makeFileObjects(data, name);
      const file_cid = await upload(files);

      // IPFS url for uploaded metadata
      const url = `https://${file_cid}.ipfs.w3s.link/${name}.json`;

      // mint the NFT and save the IPFS url to the blockchain
      let transaction = await minterContract.methods
        .createNFT(url)
        .send({ from: defaultAccount });

      let tokenCount = BigNumber.from(
        transaction.events.Transfer.returnValues.tokenId
      );

      const NFTprice = ethers.utils.parseUnits(String(price), "ether");
      console.log(NFTprice);

      await minterContract.methods
        .approve(NFTMarketplaceContractAddress.NFTMarketplace, tokenCount)
        .send({ from: kit.defaultAccount });

      await marketplaceContract.methods
        .listNFT(MyNFTContractAddress.MyNFT, tokenCount, NFTprice)
        .send({ from: defaultAccount });

      return transaction;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  });
};

// function to upload a file to IPFS
export const uploadToIpfs = async (e) => {
  const image = e.target.files;
  const image_name = image[0].name;

  if (!image) return;
  // Pack files into a CAR and send to web3.storage
  const cid = await upload(image); // Promise<CIDString>
  const image_url = `https://${cid}.ipfs.w3s.link/${image_name}`;

  return image_url;
};

// fetch all NFTs on the smart contract
export const getNfts = async (minterContract, marketplaceContract) => {
  try {
    const nfts = [];
    const nftsLength = await marketplaceContract.methods
      .getListinglength()
      .call();
    // contract starts minting from index 1
    for (let i = 1; i <= Number(nftsLength); i++) {
      const nft = new Promise(async (resolve) => {
        const listing = await marketplaceContract.methods
          .getNFTListing(i)
          .call();
        const res = await minterContract.methods.tokenURI(i).call();
        const meta = await fetchNftMeta(res);
        resolve({
          index: i,
          nft: listing.nft,
          tokenId: listing.tokenId,
          price: listing.price,
          seller: listing.seller,
          forSale: listing.forSale,
          owner: meta.owner,
          name: meta.name,
          image: meta.image,
          description: meta.description,
        });
      });
      nfts.push(nft);
    }
    return Promise.all(nfts);
  } catch (e) {
    console.log({ e });
  }
};

// get the metedata for an NFT from IPFS
export const fetchNftMeta = async (ipfsUrl) => {
  try {
    if (!ipfsUrl) return null;
    const meta = await axios.get(ipfsUrl);
    const data = JSON.parse(meta.data);
    return data;
  } catch (e) {
    console.log({ e });
  }
};

// get the owner address of an NFT
export const fetchNftOwner = async (minterContract, index) => {
  try {
    return await minterContract.methods.ownerOf(index).call();
  } catch (e) {
    console.log({ e });
  }
};

// get the address that deployed the NFT contract
export const fetchNftContractOwner = async (minterContract) => {
  try {
    let owner = await minterContract.methods.owner().call();
    return owner;
  } catch (e) {
    console.log({ e });
  }
};

export const buyNFT = async (marketplaceContract, performActions, tokenId) => {
  try {
    await performActions(async (kit) => {
      try {
        console.log(marketplaceContract, tokenId);
        const { defaultAccount } = kit;
        const listing = await marketplaceContract.methods
          .getNFTListing(tokenId)
          .call();
        await marketplaceContract.methods
          .buyNFT(tokenId)
          .send({ from: defaultAccount, value: listing.price });
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const sell = async (marketplaceContract, performActions, tokenId) => {
  try {
    await performActions(async (kit) => {
      try {
        const { defaultAccount } = kit;
        await marketplaceContract.methods
          .sell(tokenId)
          .send({ from: defaultAccount });
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const cancel = async (marketplaceContract, performActions, tokenId) => {
  try {
    await performActions(async (kit) => {
      try {
        const { defaultAccount } = kit;
        await marketplaceContract.methods
          .cancel(tokenId)
          .send({ from: defaultAccount });
      } catch (error) {
        console.log({ error });
      }
    });
  } catch (error) {
    console.log(error);
  }
};
