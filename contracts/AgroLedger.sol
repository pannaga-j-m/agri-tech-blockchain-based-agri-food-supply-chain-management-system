// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgroLedger
 * @dev A smart contract for tracking agricultural products through a supply chain,
 * including pricing and ownership transfers.
 */
contract AgroLedger {
    // Enum to represent the state of a product in the supply chain.
    enum State { Created, InTransit, OnSale }

    // Struct to log price changes at each stage.
    struct PriceEvent {
        uint256 timestamp;
        string actor; // "Farmer", "Distributor", or "Retailer"
        uint256 price; // The total price set by this actor
    }

    // Struct to log general events in the product's history.
    struct HistoryEvent {
        uint256 timestamp;
        string eventDescription;
    }

    // Main struct to hold all data for a single product.
    struct Product {
        uint256 id;
        string cropType;
        uint256 weightInKg;
        uint256 pricePerKg; // Initial price set by the farmer
        uint256 currentPrice; // The price for the next sale
        string batchNo;
        string harvestDate;
        string farmLocation;
        address payable owner; // The current owner of the product
        State state;
        HistoryEvent[] history;
        PriceEvent[] priceHistory;
        string qrCode;
    }

    // Counter for products, starting from 1.
    uint256 public productCount;
    // Mapping from a product ID to the Product struct.
    mapping(uint256 => Product) public products;

    // Events to log significant actions on the blockchain.
    event ProductCreated(uint256 indexed id, string cropType, address indexed owner, uint256 pricePerKg);
    event OwnershipTransferred(uint256 indexed id, address indexed oldOwner, address indexed newOwner, uint256 amount);
    event ProductStateUpdated(uint256 indexed id, State newState, uint256 timestamp);
    event PriceUpdated(uint256 indexed id, address indexed actor, uint256 newPrice);

    modifier onlyOwner(uint256 _productId) {
        require(msg.sender == products[_productId].owner, "Only the current owner can perform this action.");
        _;
    }

    function createProduct(
        string memory _cropType,
        uint256 _weightInKg,
        uint256 _pricePerKg,
        string memory _batchNo,
        string memory _harvestDate,
        string memory _farmLocation,
        string memory _qrCode
    ) public {
        productCount++;
        Product storage p = products[productCount];
        p.id = productCount;
        p.cropType = _cropType;
        p.weightInKg = _weightInKg;
        p.pricePerKg = _pricePerKg;
        uint256 totalPrice = _weightInKg * _pricePerKg;
        p.currentPrice = totalPrice;
        p.batchNo = _batchNo;
        p.harvestDate = _harvestDate;
        p.farmLocation = _farmLocation;
        p.owner = payable(msg.sender);
        p.state = State.Created;
        p.qrCode = _qrCode;
        
        p.history.push(HistoryEvent(block.timestamp, "Product created by Farmer."));
        p.priceHistory.push(PriceEvent(block.timestamp, "Farmer", totalPrice));

        emit ProductCreated(productCount, _cropType, msg.sender, _pricePerKg);
        emit PriceUpdated(productCount, msg.sender, totalPrice);
    }
    
    function purchaseProduct(uint256 _productId) public payable {
        Product storage p = products[_productId];
        address payable oldOwner = p.owner;
        uint256 salePrice = p.currentPrice;

        require(p.state == State.Created || p.state == State.OnSale, "This product is not currently for sale.");
        require(msg.value == salePrice, "Please submit the exact asking price to complete the purchase.");

        (bool sent, ) = oldOwner.call{value: msg.value}("");
        require(sent, "Failed to send Ether to the seller.");

        p.owner = payable(msg.sender);
        p.state = State.InTransit;

        p.history.push(HistoryEvent(block.timestamp, "Ownership transferred via purchase."));
        emit OwnershipTransferred(_productId, oldOwner, p.owner, msg.value);
    }
    
    function distributorAddCommission(uint256 _productId) public onlyOwner(_productId) {
        Product storage p = products[_productId];
        require(p.priceHistory.length == 1, "Distributor commission has already been applied.");

        uint256 newPrice = (p.currentPrice * 110) / 100;
        p.currentPrice = newPrice;
        p.state = State.OnSale;

        p.history.push(HistoryEvent(block.timestamp, "Distributor set price and listed for sale to retailers."));
        p.priceHistory.push(PriceEvent(block.timestamp, "Distributor", newPrice));
        
        emit PriceUpdated(_productId, msg.sender, newPrice);
        emit ProductStateUpdated(_productId, p.state, block.timestamp);
    }

    function retailerListForSale(uint256 _productId) public onlyOwner(_productId) {
        Product storage p = products[_productId];
        require(p.priceHistory.length == 2, "Retailer commission has already been applied.");
        require(p.state != State.OnSale, "Product is already listed for sale.");

        uint256 newPrice = (p.currentPrice * 110) / 100;
        p.currentPrice = newPrice;
        p.state = State.OnSale;

        p.history.push(HistoryEvent(block.timestamp, "Product listed for public sale by Retailer."));
        p.priceHistory.push(PriceEvent(block.timestamp, "Retailer", newPrice));
        
        emit PriceUpdated(_productId, msg.sender, newPrice);
        emit ProductStateUpdated(_productId, p.state, block.timestamp);
    }

    // ✅ REPLACED getProduct with smaller functions to avoid "Stack too deep" error.

    /**
     * @dev Gets the core details of a product.
     */
    function getProductDetails(uint256 _productId) public view returns (
        uint256 id,
        string memory cropType,
        uint256 weightInKg,
        uint256 currentPrice,
        string memory batchNo,
        string memory harvestDate,
        string memory farmLocation,
        address owner,
        State state
    ) {
        Product storage p = products[_productId];
        return (
            p.id,
            p.cropType,
            p.weightInKg,
            p.currentPrice,
            p.batchNo,
            p.harvestDate,
            p.farmLocation,
            p.owner,
            p.state
        );
    }

    /**
     * @dev Gets the transaction history of a product.
     */
    function getProductHistory(uint256 _productId) public view returns (HistoryEvent[] memory) {
        return products[_productId].history;
    }

    /**
     * @dev Gets the price history of a product.
     */
    function getProductPriceHistory(uint256 _productId) public view returns (PriceEvent[] memory) {
        return products[_productId].priceHistory;
    }
}