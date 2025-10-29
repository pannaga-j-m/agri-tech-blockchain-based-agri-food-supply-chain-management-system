// src/components/LandingPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Assuming your CSS is in the src folder

// Data for the information cards
const cardData = [
  {
    title: 'Farmers',
    description: 'Register your products on an immutable ledger, ensuring fair pricing and provenance.',
  },
  {
    title: 'Distributors',
    description: 'Track shipments in real-time and automate ownership transfers with smart contracts.',
  },
  {
    title: 'Retailers',
    description: 'Verify the authenticity and quality of products before they reach your shelves.',
  },
  {
    title: 'Consumers',
    description: 'Scan a QR code to see the complete journey of your food, from farm to table.',
  },
];

// Reusable Card Component
const InfoCard = ({ title, description }) => (
  <div className="card">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

function LandingPage() {
  const navigate = useNavigate();

  // This function will be called when the button is clicked
  const handleNavigation = () => {
    navigate('/select-role'); // Navigates to the role selection page
  };

  return (
    <>
      <header className="app-header">
        <h1>AGRI-TECH  </h1>
        <p>Bringing Transparency and Trust to the Food You Eat, Powered by Blockchain.</p>
        <button className="cta-button" onClick={handleNavigation}>
          Login or Track a Product
        </button>
      </header>

      <section className="info-section">
        <h2>Who is this for?</h2>
        <div className="card-container">
          {cardData.map((card, index) => (
            <InfoCard key={index} title={card.title} description={card.description} />
          ))}
        </div>
      </section>
    </>
  );
}

export default LandingPage;