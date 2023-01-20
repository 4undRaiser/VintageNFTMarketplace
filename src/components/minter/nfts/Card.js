import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";

const NftCard = ({ nft, buyNFT, cancelNFT, sellNFT, isOwner }) => {
  const { index, tokenId, price, seller, forSale, owner, name, image, description } = nft;


  return (
    <Col key={index}>
      <Card className=" h-100">
        <Card.Header>
          <Stack direction="horizontal" gap={2}>
            <Identicon address={owner} size={28} />
            <span className="font-monospace text-secondary">
              {truncateAddress(owner)}
            </span>
            <Badge bg="secondary" className="ms-auto">
              {index} ID
            </Badge>
            <Badge bg="secondary" className="ms-auto">
              {price / 10 ** 18} CELO
            </Badge>
          </Stack>
        </Card.Header>

        <div className=" ratio ratio-4x3">
          <img src={image} alt={description} style={{ objectFit: "cover" }} />
        </div>

        <Card.Body className="d-flex  flex-column text-center">
          <Card.Title>{name}</Card.Title>
          <Card.Text className="flex-grow-1">{description}</Card.Text>

      
         {forSale === true && isOwner === false && (
        
            <div className="d-flex m-2 justify-content-center">
            <button className="btn btn-primary" onClick={() => buyNFT(tokenId)}>
              Buy Nft
            </button>
          </div> 
            
           )}

         {forSale === false && isOwner === true && (
        
        <div className="d-flex m-2 justify-content-center">
        <button className="btn btn-primary" onClick={() => sellNFT(tokenId)}>
          Sell
        </button>
      </div> 
        
       )}

       {forSale === true && isOwner === true && (
        
        <div className="d-flex m-2 justify-content-center">
        <button className="btn btn-primary" onClick={() => cancelNFT(tokenId)}>
          Cancel Sale
        </button>
      </div> 
        
       )}

        </Card.Body>
      </Card>
    </Col>
  );
};

NftCard.propTypes = {
  // props passed into this component
  nft: PropTypes.instanceOf(Object).isRequired,
};

export default NftCard;
