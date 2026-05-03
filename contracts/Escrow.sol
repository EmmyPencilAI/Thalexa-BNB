// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ThalexaEscrow is ReentrancyGuard {
    enum EscrowStatus { PENDING, FUNDED, COMPLETED, REFUNDED }

    struct Escrow {
        address sender;
        address receiver;
        uint256 amount;
        string productId;
        EscrowStatus status;
        bool fundsReleased;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public nextEscrowId;

    event EscrowCreated(uint256 indexed escrowId, address sender, address receiver, uint256 amount);
    event FundsReleased(uint256 indexed escrowId, address receiver, uint256 amount);
    event FundsRefunded(uint256 indexed escrowId, address sender, uint256 amount);

    function createEscrow(address _receiver, string memory _productId) public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 id = nextEscrowId++;
        escrows[id] = Escrow({
            sender: msg.sender,
            receiver: _receiver,
            amount: msg.value,
            productId: _productId,
            status: EscrowStatus.FUNDED,
            fundsReleased: false
        });

        emit EscrowCreated(id, msg.sender, _receiver, msg.value);
    }

    function releaseFunds(uint256 _escrowId) public nonReentrant {
        Escrow storage e = escrows[_escrowId];
        require(e.status == EscrowStatus.FUNDED, "Escrow not in funded state");
        require(msg.sender == e.sender, "Only sender can release funds");
        
        e.status = EscrowStatus.COMPLETED;
        e.fundsReleased = true;
        
        (bool success, ) = payable(e.receiver).call{value: e.amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(_escrowId, e.receiver, e.amount);
    }

    function refundFunds(uint256 _escrowId) public nonReentrant {
        Escrow storage e = escrows[_escrowId];
        require(e.status == EscrowStatus.FUNDED, "Escrow not in funded state");
        require(msg.sender == e.receiver, "Only receiver can initiate refund (or admin)");
        
        e.status = EscrowStatus.REFUNDED;
        
        (bool success, ) = payable(e.sender).call{value: e.amount}("");
        require(success, "Transfer failed");

        emit FundsRefunded(_escrowId, e.sender, e.amount);
    }
}
