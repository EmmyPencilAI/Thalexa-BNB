// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ThalexaProductRegistry
 * @dev Manages on-chain product authenticity and product IDs
 */
contract ThalexaProductRegistry {
    address public treasury;
    uint256 public constant REGISTRATION_FEE = 0.009 ether;

    struct Product {
        string productCode; // Thalexa ID: THLX-PROD-XXXXXX
        string ipfsCid;
        address manufacturer;
        uint256 timestamp;
        bool isVerified;
    }

    mapping(string => Product) public products;
    mapping(address => string[]) public manufacturerProducts;
    uint256 public totalProducts;

    event ProductRegistered(string productCode, string ipfsCid, address manufacturer);

    constructor(address _treasury) {
        treasury = _treasury;
    }

    function registerProduct(string memory _productCode, string memory _ipfsCid) public payable {
        require(msg.value >= REGISTRATION_FEE, "Insufficient treasury fee (0.009 BNB required)");
        require(products[_productCode].manufacturer == address(0), "Product ID already exists");

        // Forward fee to treasury
        (bool sent, ) = payable(treasury).call{value: msg.value}("");
        require(sent, "Failed to send fee to treasury");

        products[_productCode] = Product({
            productCode: _productCode,
            ipfsCid: _ipfsCid,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            isVerified: true
        });

        manufacturerProducts[msg.sender].push(_productCode);
        totalProducts++;

        emit ProductRegistered(_productCode, _ipfsCid, msg.sender);
    }

    function getProduct(string memory _productCode) public view returns (Product memory) {
        return products[_productCode];
    }
}
