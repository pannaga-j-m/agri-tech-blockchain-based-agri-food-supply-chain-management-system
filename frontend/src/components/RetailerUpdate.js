import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/contractConfig";
import "./Portal.css"; // Make sure to import the shared CSS

const RetailerUpdate = () => {
    const [availableProducts, setAvailableProducts] = useState([]);
    const [ownedProducts, setOwnedProducts] = useState([]);
    const [status, setStatus] = useState("");
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
                const details = await contract.getProductDetails(i);
                
                const product = {
                    id: i.toString(),
                    cropType: details.cropType,
                    state: Number(details.state),
                    currentPrice: details.currentPrice,
                    owner: details.owner,
                };
                
                // ✅ --- THIS LINE IS ALREADY CORRECT --- ✅
                // It checks if the product is OnSale (State 2)
                // AND if the current user (account) is NOT the owner.
                if (product.state === 2 && product.owner.toLowerCase() !== account.toLowerCase()) {
                    productsForSale.push(product);
                } 
                // --- END OF CHECK ---
                
                else if (product.owner.toLowerCase() === account.toLowerCase()) {
                    productsOwned.push(product);
                }
            }
            setAvailableProducts(productsForSale);
            setOwnedProducts(productsOwned);
            setStatus('');
        } catch (err) {
            console.error("Error fetching retailer products:", err);
            setStatus("Error fetching products. Check the console.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const connectAndFetch = async () => {
            if (!window.ethereum) return;
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setCurrentAccount(account);
            fetchAllProducts(account);
        };
        connectAndFetch();
    }, [fetchAllProducts]);

    const handlePurchase = async (product) => {
        setIsLoading(true);
        setStatus(`Purchasing Product #${product.id} from distributor...`);
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
    
    const handleListForPublicSale = async (productId) => {
        setStatus(`Listing product #${productId} for public sale...`);
        setIsLoading(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            const tx = await contract.retailerListForSale(productId);
            await tx.wait();

            setStatus(`Product ${productId} is now listed for sale! Refreshing...`);
            await fetchAllProducts(currentAccount);
        } catch (err) {
            setStatus("Update failed.");
            alert(err.reason || "Function call failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStateString = (stateNum) => {
        return ["Created", "In Transit", "On Sale"][stateNum] || "Unknown";
    };

    return (
        <div className="page-container retailer-portal">
            <div className="page-header">
                <h1>Retailer Portal</h1>
            </div>
            {currentAccount && <div className="wallet-display">Connected: {`${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`}</div>}
            {status && <p className="status-message">{status}</p>}

            <div className="product-list">
                <h3>Available Products from Distributors</h3>
                {isLoading && <p>Loading...</p>}
                {!isLoading && availableProducts.length === 0 && <p>No new products available from distributors.</p>}
                {availableProducts.map(product => (
                    <div key={product.id} className="action-card" style={{ borderColor: '#ff9800' }}>
                        <p><strong>Product ID:</strong> {product.id}</p>
                        <p><strong>Crop Type:</strong> {product.cropType}</p>
                        <p><strong>Distributor's Price:</strong> {ethers.formatEther(product.currentPrice)} ETH</p>
                        <p><strong>Distributor Address:</strong> {product.owner}</p>
                        <button onClick={() => handlePurchase(product)} style={{ backgroundColor: '#ff9800' }} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Purchase from Distributor'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="product-list">
                <h2>Your Inventory</h2>
                {!isLoading && ownedProducts.length === 0 && <p>You have no products in your inventory.</p>}
                {ownedProducts.map((p) => (
                    <div key={p.id} className="action-card" style={{ borderColor: '#e91e63' }}>
                        <p><strong>Product ID:</strong> {p.id}</p>
                        <p><strong>Crop Type:</strong> {p.cropType}</p>
                        <p><strong>Your Purchase Price:</strong> {ethers.formatEther(p.currentPrice)} ETH</p>
                        <p><strong>Status:</strong> {getStateString(p.state)}</p>
                        
                        {p.state === 1 && (
                             <button 
                                onClick={() => handleListForPublicSale(p.id)} 
                                style={{ backgroundColor: '#e91e63', marginTop: '10px' }} 
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Add 10% Commission & List for Public Sale'}
                            </button>
                        )}
                         {p.state === 2 && (
                            <p style={{color: 'green', fontWeight: 'bold'}}>This product is now on sale to consumers.</p>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RetailerUpdate;