import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from "../utils/contractConfig";
import { FaLeaf, FaTruck, FaStore, FaUsers } from 'react-icons/fa';

const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card" style={{ borderColor: color }}>
        <div className="stat-card-icon" style={{ backgroundColor: color }}>
            {icon}
        </div>
        <div className="stat-card-info">
            <h4>{title}</h4>
            <p>{value}</p>
        </div>
    </div>
);

const GlobalDashboard = () => {
    const [stats, setStats] = useState({ totalStakeholders: 0, farmerCount: 0, distributorCount: 0, retailerCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        if (!window.ethereum) {
            alert("Please install MetaMask to view the dashboard.");
            setIsLoading(false);
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractABI, provider);
            const productCountBigInt = await contract.productCount();
            const totalProducts = Number(productCountBigInt);
            const farmerSet = new Set(), distributorSet = new Set(), retailerSet = new Set();

            for (let i = 1; i <= totalProducts; i++) {
                // Find the Farmer by querying the ProductCreated event
                const farmerFilter = contract.filters.ProductCreated(i);
                const farmerEvents = await contract.queryFilter(farmerFilter, 0, 'latest');
                if (farmerEvents.length > 0) farmerSet.add(farmerEvents[0].args.owner);

                // Find Distributor and Retailer by querying OwnershipTransferred events
                const transferFilter = contract.filters.OwnershipTransferred(i);
                const transferEvents = await contract.queryFilter(transferFilter, 0, 'latest');
                if (transferEvents.length >= 1) distributorSet.add(transferEvents[0].args.newOwner);
                if (transferEvents.length >= 2) retailerSet.add(transferEvents[1].args.newOwner);
            }
            const allStakeholders = new Set([...farmerSet, ...distributorSet, ...retailerSet]);
            setStats({ totalStakeholders: allStakeholders.size, farmerCount: farmerSet.size, distributorCount: distributorSet.size, retailerCount: retailerSet.size });
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
            alert("Could not fetch dashboard data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (isLoading) {
        return <p className="status-message" style={{textAlign: 'center', marginTop: '40px'}}>Loading global dashboard data...</p>;
    }

    return (
        <div className="container">
            <h1 className="page-header">Global Supply Chain Dashboard</h1>
            <div className="stats-grid">
                <StatCard title="Total Unique Stakeholders" value={stats.totalStakeholders} icon={<FaUsers />} color="var(--primary-color)" />
                <StatCard title="Unique Farmers" value={stats.farmerCount} icon={<FaLeaf />} color="var(--success-color)" />
                <StatCard title="Unique Distributors" value={stats.distributorCount} icon={<FaTruck />} color="var(--warning-color)" />
                <StatCard title="Unique Retailers" value={stats.retailerCount} icon={<FaStore />} color="var(--danger-color)" />
            </div>
        </div>
    );
};

export default GlobalDashboard;