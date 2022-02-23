import React, { useEffect, useState } from 'react'
import './App.css'
import backgroundVideo from "./assets/background.mp4"
import nht from "./assets/nht.gif"
import { useMoralis } from "react-moralis";
import abi from "./contracts/contracts.json";
import { ethers } from "ethers";     
import ReactLoading from 'react-loading';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            

function App() {
  const { authenticate, isAuthenticated, user, enableWeb3, logout, Moralis } = useMoralis();
  const CONTRACT_ADDRESS = "0x8013B8245c5046F034d7465cf6897a481111c5ea";
  const [supply, setSupply] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [completed, setCompleted] =useState(false)
  const [hash, setHash] = useState();

  const startOver = () => { //make everything reset after minting
    setCompleted(false);
    setInProgress(false);
    setHash(null); //this way the code is clean
    logout();
  }

  const checkEtherscan = () => {
    let url = "https://rinkeby.etherscan.io/tx/" + hash;
    window.open(url, "blank"); //blank means to open up a new blank tab
  }

  const mint = async () => {
    const sendOptions = {
      contractAddress: CONTRACT_ADDRESS,
      functionName: "mint",
      abi: abi,
      params: {
        amount: 1,
      },
      msgValue: 1000000000000000
    };
    setCompleted(false);
    const transaction = await Moralis.executeFunction(sendOptions);  //write contract method in Moralis
    setInProgress(true);
    console.log(transaction.hash);
    setHash(transaction.hash); //sets the function so i can see the etherscan transaction page
    await transaction.wait(3).then((receipt)=>{  //means three computers confirmed my transaction
      setInProgress(false);
      setCompleted(true); //means three computers confirmed my transaction
      
    })
    console.log(transaction)
  }

  useEffect( async ()=>{
    if(isAuthenticated){
      // connect the contract
      const web3Provider = await enableWeb3();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, web3Provider);
      // get the total supply from the contract
      const totalSupplyHex = await contract.totalSupply(0);
      setSupply(totalSupplyHex.toNumber());
      // console.log(totalSupplyHex.toNumber());
      // console.log(contract)
    }
    

  }, [isAuthenticated])
  
  return (
    <div className="App">
        <video className='background-video' src={backgroundVideo} width="600" height="300" playsInline={true} muted={true} autoPlay={true} loop={true}/>
        <div className='main'>
          <div className='left-main'>
            <img className='nht' src={nht}/>
          </div>
          <div className='right-main'>
            <h2> 
              NeighboorHood Tales: 🎶Would you be my neighbor? 🎶
            </h2>
            <div className='description'>{supply} minted / 200</div>
            {completed &&  //if completed is true
              <div className='description'>Congratulations! You have minted 1 NFT!</div>
            }
            <div className='actions'>
            {isAuthenticated ?
                <>
                  { inProgress ?
                    <div>
                    <ReactLoading type="bubbles" color="#fff" height={64} />
                    <button onClick={checkEtherscan} className='filled'>Check Etherscan</button>
                  </div>
                     :
                  <button onClick={mint} className='filled'>Mint</button>
                  }
                  <button onClick={startOver} className='transparent'> Start Over</button> 
                </>
                  :
                  <button onClick={authenticate} className='filled'>Connect Wallet</button>
                }
            </div>
          </div>
        </div>
    </div>
  )
}

export default App
