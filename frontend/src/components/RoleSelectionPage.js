import React from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaTruck, FaStore, FaUser, FaGlobe } from 'react-icons/fa'; // <-- Re-add FaGlobe
import './RoleSelectionPage.css';

const RoleSelectionPage = () => {
    return (
        <div className="role-selection-background">
            <div className="role-selection-container">
                <Link to="/" className="back-button">
                    &larr; Back to Home
                </Link>
                <div className="role-header">
                    <h1>Welcome to AgroLedger</h1>
                    <p>Select your role in the supply chain to begin.</p>
                </div>
                <div className="role-grid">
                    <Link to="/farmer" className="role-card farmer">
                        <FaLeaf size={40} />
                        <span>Farmer</span>
                    </Link>
                    <Link to="/distributor" className="role-card distributor">
                        <FaTruck size={40} />
                        <span>Distributor</span>
                    </Link>
                    <Link to="/retailer" className="role-card retailer">
                        <FaStore size={40} />
                        <span>Retailer</span>
                    </Link>
                    <Link to="/consumer" className="role-card consumer">
                        <FaUser size={40} />
                        <span>Consumer</span>
                    </Link>
                </div>

                {/* --- Add this section back --- */}
                <div className="dashboard-link-container">
                    <Link to="/dashboard" className="dashboard-link">
                        <FaGlobe />
                        <span>View Global Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;