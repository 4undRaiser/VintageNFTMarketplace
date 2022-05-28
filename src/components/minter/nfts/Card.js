import React from "react";
import PropTypes from "prop-types";
import { Card, Col, Badge, Stack } from "react-bootstrap";
import { truncateAddress } from "../../../utils";
import Identicon from "../../ui/Identicon";

const NftCard = ({ nft, buyNFT, cancelListing, isSold, isOwner, isCanceled }) => {
  const { owner, price, image, description, name, index } = nft;



  const handleCancel = (index)=>{
    cancelListing(index);
}


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

      
         {isSold ? (
            <div className="d-flex m-2 justify-content-center">
              <button
                className={`btn ${isOwner ? "btn-danger" : "btn-secondary"}`}
              >
                {isOwner ? "Bought" : "Sold"}
              </button>
            </div>
          ) : (
         
            <div className="d-flex m-2 justify-content-center">
            <button onClick={isCanceled === false ? buyNFT : null}className="btn btn-primary">
            {isCanceled ?  "Listing Canceled": "Buy"}
            </button>
          </div>    
           )}
      

    {isOwner ? (
            <div className="d-flex m-2 justify-content-center">
              <button onClick={()=>handleCancel(index)} className="btn btn-primary">
                Cancel Listing
              </button>
            </div>
          ) : (
            <div className="d-flex m-2 justify-content-center">
              <button className="btn btn-danger">
                Can't Cancel this Listing
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
