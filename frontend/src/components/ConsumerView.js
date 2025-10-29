import { useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/contractConfig";
import "./Portal.css";

const ConsumerView = () => {
    const [productId, setProductId] = useState("");
    const [product, setProduct] = useState(null);
    const [status, setStatus] = useState("");

    const fetchProduct = async () => {
        if (!productId) return;
        if (!window.ethereum) return alert("Please install MetaMask to track products.");
        
        setStatus("Fetching product details...");
        setProduct(null);
        
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);

            const [details, history, priceHistory] = await Promise.all([
                contract.getProductDetails(productId),
                contract.getProductHistory(productId),
                contract.getProductPriceHistory(productId)
            ]);

            if (details && Number(details[0]) > 0) {
                const productDetails = {
                    id: details[0],
                    cropType: details[1],
                    weightInKg: details[2],
                    currentPrice: details[3],
                    batchNo: details[4],
                    harvestDate: details[5],
                    farmLocation: details[6],
                    owner: details[7],
                    state: details[8],
                };

                setProduct({
                    ...productDetails,
                    history,
                    priceHistory
                });
                setStatus("");
            } else {
                setProduct(null);
                setStatus(`Product with ID #${productId} not found.`);
            }
        } catch (error) {
            console.error("Failed to fetch product:", error);
            setStatus("An error occurred while fetching the product.");
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp || Number(timestamp) === 0) return "N/A";
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleString();
    };
    
    const getStateString = (stateNum) => {
        return ["Created", "In Transit", "On Sale"][stateNum] || "Unknown";
    };

    return (
        <div className="page-container consumer-view">
            <h2>Consumer: Track Product</h2>
            <div>
                <input placeholder="Enter Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
                <button onClick={fetchProduct}>Track</button>
            </div>

            {status && <p className="status-message">{status}</p>}

            {product && (
                <div style={{ marginTop: "20px" }}>
                    <h3>Tracking Details for Product #{Number(product.id)}</h3>
                    <p><strong>Crop Type:</strong> {product.cropType}</p>
                    <p><strong>Batch No:</strong> {product.batchNo}</p>
                    <p><strong>Weight:</strong> {Number(product.weightInKg)} kg</p>
                    <p><strong>Harvest Date:</strong> {product.harvestDate}</p>
                    <p><strong>Farm Location:</strong> {product.farmLocation}</p>
                    <p><strong>Status:</strong> {getStateString(product.state)}</p>
                    <p><strong>Final Price:</strong> {product.currentPrice ? ethers.formatEther(product.currentPrice) : 'N/A'} ETH</p>
                    
                    <hr/>
                    <h4>Price Journey</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {product.priceHistory.map((event, index) => {
                            // ✅ CALCULATE PRICE PER KG
                            const weight = Number(product.weightInKg);
                            const totalPrice = parseFloat(ethers.formatEther(event.price));
                            const pricePerKg = weight > 0 ? (totalPrice / weight).toFixed(4) : 0;

                            return (
                                <li key={index} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                    <strong>{event.actor}'s Total Price: {totalPrice.toFixed(4)} ETH</strong>
                                    {/* ✅ DISPLAY PRICE PER KG */}
                                    <p style={{ margin: '5px 0 0', color: '#555' }}>Price per kg: {pricePerKg} ETH</p>
                                    <span style={{ fontSize: '0.9em', color: '#777' }}>
                                        Date: {formatTimestamp(event.timestamp)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                    <hr/>
                    <h4>Transaction History</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {product.history.map((event, index) => (
                            <li key={index} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                                <strong>{event.eventDescription}</strong>
                                <br />
                                <span style={{ fontSize: '0.9em', color: '#555' }}>
                                    Date: {formatTimestamp(event.timestamp)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ConsumerView;