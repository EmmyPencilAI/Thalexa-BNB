// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ThalexaProductRegistry {
    struct Product {
        string productCode;
        string ipfsCid;
        address owner;
        bool isAuthentic;
        uint256 createdAt;
    }

    mapping(string => Product) public products;
    mapping(address => string[]) public ownerProducts;

    event ProductRegistered(string productCode, string ipfsCid, address indexed owner);

    function registerProduct(string memory _productCode, string memory _ipfsCid) public {
        require(products[_productCode].createdAt == 0, "Product already exists");
        
        products[_productCode] = Product({
            productCode: _productCode,
            ipfsCid: _ipfsCid,
            owner: msg.sender,
            isAuthentic: true,
            createdAt: block.timestamp
        });

        ownerProducts[msg.sender].push(_productCode);
        
        emit ProductRegistered(_productCode, _ipfsCid, msg.sender);
    }

    function verifyProduct(string memory _productCode) public view returns (
        bool exists,
        string memory ipfsCid,
        address owner,
        uint256 createdAt
    ) {
        Product memory p = products[_productCode];
        if (p.createdAt == 0) return (false, "", address(0), 0);
        return (true, p.ipfsCid, p.owner, p.createdAt);
    }
}
