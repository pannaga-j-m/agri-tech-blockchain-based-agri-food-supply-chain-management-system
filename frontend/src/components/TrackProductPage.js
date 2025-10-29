import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/contractConfig";

const TrackProductPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setLoading(false);
                return;
            }

            if (!window.ethereum) {
                setError("Please install MetaMask to view this page.");
                setLoading(false);
                return;
            }

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const contract = new ethers.Contract(contractAddress, contractABI, provider);
                
                const [details, history, priceHistory] = await Promise.all([
                    contract.getProductDetails(productId),
                    contract.getProductHistory(productId),
                    contract.getProductPriceHistory(productId)
                ]);
                
                if (Number(details.id) > 0) {
                    setProduct({
                        ...details,
                        history,
                        priceHistory
                    });
                } else {
                    setError(`Product with ID #${productId} not found.`);
                }
            } catch (err) {
                console.error("Failed to fetch product:", err);
                setError("An error occurred while fetching product data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    const formatTimestamp = (timestamp) => {
        if (!timestamp || Number(timestamp) === 0) return "N/A";
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString();
    };

    if (loading) return <p className="status-message">Loading product data...</p>;
    if (error) return <p className="status-message" style={{color: 'red'}}>{error}</p>;
    if (!product) return <p className="status-message">Product not found.</p>;

    return (
        <div className="page-container track-page">
            <h2>Product Journey for ID #{Number(product.id)}</h2>
            
            <div className="action-card">
                <h3>Current Details</h3>
                <p><strong>Crop Type:</strong> {product.cropType}</p>
                <p><strong>Batch No:</strong> {product.batchNo}</p>
                <p><strong>Weight:</strong> {Number(product.weightInKg)} kg</p>
                <p><strong>Harvest Date:</strong> {product.harvestDate}</p>
                <p><strong>Farm Location:</strong> {product.farmLocation}</p>
                <p><strong>Final Price:</strong> {ethers.formatEther(product.currentPrice)} ETH</p>
                <p><strong>Current Owner:</strong> {product.owner}</p>
            </div>

            <div className="action-card">
                <h3>Price Journey</h3>
                <ul className="history-list">
                    {product.priceHistory.map((event, index) => {
                        // --- START OF FIX ---
                        // Get the total weight (e.g., 100)
                        const weight = Number(product.weightInKg);
                        // Get the total price (e.g., 10 ETH)
                        const totalPrice = parseFloat(ethers.formatEther(event.price));
                        // Calculate price per kg (e.g., 10 / 100 = 0.1 ETH)
                        const pricePerKg = weight > 0 ? (totalPrice / weight).toFixed(4) : 0;
                        // --- END OF FIX ---
                        
                        return (
                            <li key={index}>
                                {/* Display the "per kg" price */}
                                <p><strong>{event.actor}'s Price (per kg):</strong> {pricePerKg} ETH</p>
                                {/* Optionally, keep the total price for reference */}
                                <p style={{fontSize: '0.9em', color: '#555'}}>Total Batch Price: {totalPrice.toFixed(4)} ETH</p>
                                <span>Date: {formatTimestamp(event.timestamp)}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="action-card">
                <h3>Transaction History</h3>
                <ul className="history-list">
                    {product.history.map((event, index) => (
                        <li key={index}>
                            <p><strong>{event.eventDescription}</strong></p>
                            <span>Date: {formatTimestamp(event.timestamp)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TrackProductPage;