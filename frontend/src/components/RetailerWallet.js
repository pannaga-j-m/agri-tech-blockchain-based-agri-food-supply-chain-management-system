// src/components/RetailerWallet.js
import { useState, useEffect } from 'react';

const RetailerWallet = () => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("Install MetaMask!");
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Optional: check if already connected
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <div style={{ marginBottom: "20px" }}>
      {account ? (
        <p>Retailer Account: {account}</p>
      ) : (
        <button onClick={connectWallet} style={{backgroundColor: "#e91e63", color: "white"}}>Connect Retailer Wallet</button>
      )}
    </div>
  );
};

export default RetailerWallet;