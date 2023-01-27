import React from "react";
import Cover from "./components/minter/Cover";
import { Notification } from "./components/ui/Notifications";
import Wallet from "./components/Wallet";
import { useBalance, useMinterContract, useMarketplaceContract } from "./hooks";
import Nfts from "./components/minter/nfts";
import { useContractKit } from "@celo-tools/use-contractkit";
import "./App.css";
import { Container, Nav } from "react-bootstrap";

const App = function AppWrapper() {
  const { address, destroy, connect } = useContractKit();
  const { balance, getBalance } = useBalance();

  // initialize the NFT mint contract
  const minterContract = useMinterContract();

  // initialize the NFT marketplace contract
  const marketplaceContract = useMarketplaceContract();

  return (
    <>
      <Notification />

      {address ? (
        <Container fluid="md">
          <Nav className="justify-content-end pt-3 pb-5">
            <Nav.Item>
              {/*display user wallet*/}
              <Wallet
                address={address}
                amount={balance.CELO}
                symbol="CELO"
                destroy={destroy}
              />
            </Nav.Item>
          </Nav>
          <main>
            {/*list NFTs*/}
            <Nfts
              name="Vintage Marketplace"
              updateBalance={getBalance}
              minterContract={minterContract}
              marketplaceContract={marketplaceContract}
            />
          </main>
        </Container>
      ) : (
        //  if user wallet is not connected display cover page
        <Cover
          name="Vintage Marketplace"
          coverImg="https://hooversun.com/downloads/26900/download/200227_Vintage_Market_Days9.jpg?cb=63b3080cc9c830a1020cd6404310bf70&w={width}&h={height}"
          connect={connect}
        />
      )}
    </>
  );
};

export default App;
