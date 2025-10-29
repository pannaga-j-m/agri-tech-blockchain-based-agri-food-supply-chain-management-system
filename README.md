A full-stack, blockchain-based supply chain application for tracking agricultural products from farm to consumer. This project uses a Solidity smart contract to manage product ownership and a React.js frontend to provide a user interface for each stakeholder.

About The Project
This project solves the problem of transparency and trust in the food supply chain. By using an immutable blockchain ledger, it creates a verifiable record of a product's journey. Consumers can track a product's full history to verify its origin, and each stakeholder in the chain (Farmer, Distributor, Retailer) has a clear, role-based interface to manage their assets.

The application uses a hybrid Web2/Web3 model:

Web3 (Blockchain): Manages all product assets, ownership transfers, and price history.

Web2 (Backend Server): Manages user accounts (username/password) for role identification.

Key Features
Immutable Tracking: Every product's history (creation, price changes, ownership) is permanently stored on the blockchain.

Role-Based Portals: Separate and distinct user interfaces for the Farmer, Distributor, Retailer, and Consumer.

Secure Ownership: Smart contract logic ensures only the current owner of a product can modify it or list it for sale.

Direct P2P Payments: The purchaseProduct function automatically and securely transfers payment (ETH) directly to the product's previous owner.

Price Transparency: Consumers can view the complete "Price Journey" of a product, showing the price set by the Farmer, Distributor, and Retailer.

Global Dashboard: A high-level view of all unique stakeholders (farmers, distributors, retailers) involved in the supply chain.

Technology Stack
Frontend:

React.js

Ethers.js (for blockchain interaction)

React Router

CSS

Backend:

Node.js

Express.js

MongoDB (for user account database)

Mongoose

bcrypt (for password hashing)

Blockchain:

Solidity (for smart contracts)

Hardhat (for development and testing)

MetaMask (for wallet integration)

Getting Started
Follow these steps to get a local copy up and running.

Prerequisites
Node.js (v18+): Download Here

Git: Download Here

MongoDB: You need a running MongoDB instance. The easiest way is a free MongoDB Atlas cloud account.

MetaMask: A browser extension wallet.

Installation & Setup
Clone the Repo:

Bash

git clone https://github.com/YourUsername/YourProjectName.git
cd YourProjectName
Set Up the Backend:

Bash

cd backend
npm install
Create a file named .env in the backend folder.

Add your MongoDB connection string to it: MONGO_URI=Your_MongoDB_Connection_String_Goes_Here

In a separate terminal, start the backend server:

Bash

npm start
The server will be running on http://localhost:5001.

Set Up the Blockchain:

In a new terminal, go to the project's root folder (the one containing hardhat.config.js).

Bash

npm install
Start a local Hardhat blockchain node:

Bash

npx hardhat node
This will start a local chain on http://127.0.0.1:8545/. Keep this terminal running.

In another new terminal, deploy your contract to the local node:

Bash

npx hardhat run scripts/deploy.js --network localhost
Crucial: Copy the deployed contract address from the terminal output.

Set Up the Frontend:

Bash

cd frontend
npm install
Navigate to frontend/src/utils/contractConfig.js.

Paste your deployed contract address into the contractAddress variable.

Start the frontend app:

Bash

npm start
Your React application will open on http://localhost:3000.

Configure MetaMask:

Add the Hardhat local network to MetaMask (Network URL: http://127.0.0.1:8545, Chain ID: 31337).

Import at least 3 test accounts using the private keys provided by the npx hardhat node terminal output. Designate them as "Farmer," "Distributor," and "Retailer."

Usage
Farmer:

Connect your Farmer wallet in MetaMask.

Go to the Farmer Portal.

Fill out the form to register a new product.

Distributor:

Switch to your Distributor wallet in MetaMask.

Go to the Distributor Portal.

The Farmer's product will appear under "Available Products."

Purchase the product. It will then move to your "My Inventory."

Click "Add 10% Commission" to list it for sale.

Retailer:

Switch to your Retailer wallet in MetaMask.

Go to the Retailer Portal.

The Distributor's product will appear. Purchase it.

It will move to your "My Inventory." Click to list it for public sale.

Consumer:

Go to the Consumer Portal or Track Product page.

Enter the Product ID.

You will see the full, transparent history and price journey of the product
