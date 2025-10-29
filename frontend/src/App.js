import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
// Import all page components
import LandingPage from './components/LandingPage';
import RoleSelectionPage from './components/RoleSelectionPage';
import FarmerAddProduct from './components/FarmerAddProduct';
import DistributorUpdate from './components/DistributorUpdate';
import RetailerUpdate from './components/RetailerUpdate';
import ConsumerView from './components/ConsumerView';
import TrackProductPage from './components/TrackProductPage';
import GlobalDashboard from './components/GlobalDashboard'; // <-- Import the dashboard

// Import the shared stylesheet
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <main className="content-area">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/select-role" element={<RoleSelectionPage />} />
            <Route path="/farmer" element={<FarmerAddProduct />} />
            <Route path="/distributor" element={<DistributorUpdate />} />
            <Route path="/retailer" element={<RetailerUpdate />} />
            <Route path="/consumer" element={<ConsumerView />} />
            <Route path="/track/:productId" element={<TrackProductPage />} />
            <Route path="/dashboard" element={<GlobalDashboard />} /> {/* <-- Add the route back */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;