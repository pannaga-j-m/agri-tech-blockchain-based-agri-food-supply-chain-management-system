import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/contractConfig";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FarmerAddProduct = () => {
    // --- State variables ---
    const [cropType, setCropType] = useState("");
    const [weight, setWeight] = useState("");
    const [pricePerKg, setPricePerKg] = useState("");
    const [batchNo, setBatchNo] = useState("");
    const [harvestDate, setHarvestDate] = useState(new Date());
    const [farmLocation, setFarmLocation] = useState("");
    const [status, setStatus] = useState("");
    const [addedProduct, setAddedProduct] = useState(null);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const connectWallet = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setCurrentAccount(accounts[0]);
                    window.ethereum.on('accountsChanged', (newAccounts) => {
                        setCurrentAccount(newAccounts[0] || null);
                        setAddedProduct(null);
                    });
                } catch (error) {
                    console.error("Error connecting wallet:", error);
                }
            } else {
                alert("Please install MetaMask.");
            }
        };
        connectWallet();
    }, []);

    const submitProduct = async () => {
        if (!cropType || !weight || !pricePerKg || !batchNo || !farmLocation) return alert("Please fill in all fields.");
        if (!currentAccount) return alert("Please connect your wallet first.");

        setIsLoading(true);
        setStatus("Registering product... Please wait.");
        setAddedProduct(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            const qrCodeData = `Product details for Batch: ${batchNo}`;

            // ✅ FIX: Ensure numeric types are correctly formatted before sending.
            const weightAsNumber = parseInt(weight, 10);
            const priceInWei = ethers.parseEther(pricePerKg.toString());
            const formattedHarvestDate = harvestDate.toLocaleDateString('en-GB'); // Use a consistent format e.g., DD/MM/YYYY

            const tx = await contract.createProduct(
                cropType,
                weightAsNumber,     // Pass as a number
                priceInWei,         // Pass as a BigInt (from parseEther)
                batchNo,
                formattedHarvestDate, // Pass the formatted date string
                farmLocation,
                qrCodeData
            );

            const receipt = await tx.wait();
            
            let newProductId = null;
            const event = receipt.logs
                .map(log => {
                    try { return contract.interface.parseLog(log); } catch (e) { return null; }
                })
                .find(parsedLog => parsedLog && parsedLog.name === "ProductCreated");

            if (event && event.args && event.args.id) {
                newProductId = event.args.id.toString();
            }

            if (newProductId) {
                setStatus(`Product successfully registered with ID: ${newProductId}!`);
                const totalPrice = parseFloat(weight) * parseFloat(pricePerKg);
                setAddedProduct({ id: newProductId, name: cropType, price: totalPrice });
            } else {
                setStatus(`Registration succeeded, but the new ID could not be found.`);
            }

        } catch (error) {
            console.error("Error registering product:", error);
            setStatus(`Registration failed: ${error.reason || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>Farmer Portal</h1>
            </div>
            {currentAccount && <div className="wallet-display">Connected: {`${currentAccount.substring(0, 6)}...${currentAccount.substring(38)}`}</div>}
            
            <div className="action-card" style={{ borderColor: '#28a745' }}>
                <h2 style={{ borderBottomColor: '#28a745' }}>Add a New Product</h2>
                <input type="text" placeholder="Crop Type (e.g., Apple, Tomato)" value={cropType} onChange={(e) => setCropType(e.target.value)} />
                <input type="number" placeholder="Weight (in Kg)" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <input type="number" placeholder="Price per Kg (in ETH)" value={pricePerKg} onChange={(e) => setPricePerKg(e.targe.value)} />
                <input type="text" placeholder="Batch Number" value={batchNo} onChange={(e) => setBatchNo(e.target.value)} />
                <DatePicker selected={harvestDate} onChange={(date) => setHarvestDate(date)} className="date-picker"/>
                <input type="text" placeholder="Farm Location" value={farmLocation} onChange={(e) => setFarmLocation(e.target.value)} />
                <button onClick={submitProduct} style={{ backgroundColor: '#28a745' }} disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Register Product'}
                </button>
                {status && <p className="status-message">{status}</p>}
            </div>

            {addedProduct && (
                 <div className="action-card" style={{ borderColor: '#ff9800' }}>
                    <h2 style={{ borderBottomColor: '#ff9800' }}>Product Registered: #{addedProduct.id}</h2>
                    <p><strong>Crop Type:</strong> {addedProduct.name}</p>
                    <p><strong>Total Price:</strong> {addedProduct.price} ETH</p>
                    <p className="status-message">The distributor can now purchase this product from their portal.</p>
                </div>
            )}
        </div>
    );
};

export default FarmerAddProduct;