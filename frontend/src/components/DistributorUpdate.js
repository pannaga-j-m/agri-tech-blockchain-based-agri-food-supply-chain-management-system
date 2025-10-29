import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "../utils/contractConfig";
import "./Portal.css";

const DistributorUpdate = () => {
    const [availableProducts, setAvailableProducts] = useState([]);
    const [ownedProducts, setOwnedProducts] = useState([]);
    const [status, setStatus] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchAllProducts = useCallback(async (account) => {
        if (!account) return;
        setIsLoading(true);
        setStatus('Fetching all products...');
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const productCount = await contract.productCount();
            const productsForSale = [];
            const productsOwned = [];

            for (let i = 1; i <= productCount; i++) {
                const [details, priceHistory] = await Promise.all([
                    contract.getProductDetails(i),
                    contract.getProductPriceHistory(i)
                ]);

                const product = {
                    id: i.toString(),
                    cropType: details.cropType,
                    currentPrice: details.currentPrice,
                    owner: details.owner,
                    state: Number(details.state),
                    priceHistoryLength: priceHistory.length,
                };

                // --- FIX 1 ---
                // Show products for sale (State 0) ONLY IF the user is NOT the owner
                if (product.state === 0 && product.owner.toLowerCase() !== account.toLowerCase()) {
                    productsForSale.push(product);
                }
                
                // --- FIX 2 ---
                // Show products in "My Inventory" ONLY IF the user IS the owner
                // AND the product is in a Distributor-owned state (InTransit or OnSale)
                else if (
                    product.owner.toLowerCase() === account.toLowerCase() &&
                    (product.state === 1 || product.state === 2) 
                ) {
                    productsOwned.push(product);
                }
            }
            setAvailableProducts(productsForSale);
            setOwnedProducts(productsOwned);
            setStatus('');
        } catch (error) {
            console.error("Failed to fetch products:", error);
            setStatus("Error fetching products. Please check the console.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const connectAndFetch = async () => {
            if (!window.ethereum) return alert("Please install MetaMask.");
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                setCurrentAccount(account);
                fetchAllProducts(account);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        };
        connectAndFetch();
    }, [fetchAllProducts]);

    const handlePurchase = async (product) => {
        setIsLoading(true);
        setStatus(`Purchasing Product #${product.id}...`);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            const tx = await contract.purchaseProduct(product.id, {
                value: product.currentPrice
            });
            await tx.wait();

            setStatus('Purchase successful! Refreshing...');
            await fetchAllProducts(currentAccount);
        } catch (err) {
            console.error("Purchase failed:", err);
            setStatus(`Purchase failed: ${err.reason || 'Check console.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCommission = async (productId) => {
        setIsLoading(true);
        setStatus(`Applying 10% commission for Product #${productId}...`);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            const tx = await contract.distributorAddCommission(productId);
            await tx.wait();
            setStatus('Commission added! The product is now for sale to retailers. Refreshing...');
            await fetchAllProducts(currentAccount);
        } catch (err) {
            console.error("Commission failed:", err);
            setStatus(`Failed: ${err.reason || 'Check console.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container distributor-portal">
            <div className="page-header">
                <h1>Distributor Portal</h1>
            </div>
            {currentAccount && <div className="wallet-display">Connected: {`${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`}</div>}
            {status && <p className="status-message">{status}</p>}

            <div className="product-list">
                <h3>Available Products for Purchase</h3>
                {isLoading && <p>Loading...</p>}
                {!isLoading && availableProducts.length === 0 && <p>No new products available from farmers.</p>}
                {availableProducts.map(product => (
                    <div key={product.id} className="action-card" style={{ borderColor: '#28a745' }}>
                        <p><strong>Product ID:</strong> {product.id}</p>
                        <p><strong>Crop Type:</strong> {product.cropType}</p>
                        <p><strong>Farmer's Price:</strong> {ethers.formatEther(product.currentPrice)} ETH</p>
                        <p><strong>Farmer Address:</strong> {product.owner}</p>
                        <button onClick={() => handlePurchase(product)} style={{ backgroundColor: '#28a745' }} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Purchase from Farmer'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="product-list">
                <h3>My Inventory</h3>
                {!isLoading && ownedProducts.length === 0 && <p>You do not own any products.</p>}
                {ownedProducts.map(product => (
                    <div key={product.id} className="action-card" style={{ borderColor: '#ff9800' }}>
                        <p><strong>Product ID:</strong> {product.id}</p>
                        <p><strong>Crop Type:</strong> {product.cropType}</p>
                        <p><strong>Purchase Price:</strong> {ethers.formatEther(product.currentPrice)} ETH</p>
                        
                        {/* This logic is now also correct.
                          The button will show if the product is InTransit (State 1) 
                          AND the price history is 1 (meaning commission not added yet).
                          The `product.state === 1` check is implied by priceHistoryLength.
                        */}
                        {product.priceHistoryLength === 1 && (
                            <button onClick={() => handleAddCommission(product.id)} style={{ backgroundColor: '#ff9800' }} disabled={isLoading}>
                                {isLoading ? 'Processing...' : 'Add 10% Commission & List for Sale'}
                            </button>
                        )}
                        {product.priceHistoryLength > 1 && (
                            <p style={{ color: 'green', fontWeight: 'bold' }}>This product is now on sale to retailers.</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DistributorUpdate;