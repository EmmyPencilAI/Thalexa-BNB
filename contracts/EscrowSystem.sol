// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ThalexaEscrow
 * @dev Secure fund locking for cross-border commerce
 */
contract ThalexaEscrow {
    enum Status { OPEN, FUNDED, RELEASED, REFUNDED }

    struct Escrow {
        address sender;
        address receiver;
        uint256 amount;
        string productId;
        Status status;
        uint256 createdAt;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;

    event EscrowCreated(uint256 id, address sender, address receiver, uint256 amount);
    event FundsReleased(uint256 id);
    event FundsRefunded(uint256 id);

    function createEscrow(address _receiver, string memory _productId) public payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than 0");
        
        uint256 id = escrowCount++;
        escrows[id] = Escrow({
            sender: msg.sender,
            receiver: _receiver,
            amount: msg.value,
            productId: _productId,
            status: Status.FUNDED,
            createdAt: block.timestamp
        });

        emit EscrowCreated(id, msg.sender, _receiver, msg.value);
        return id;
    }

    function releaseFunds(uint256 _id) public {
        Escrow storage e = escrows[_id];
        require(msg.sender == e.sender, "Only sender can release funds");
        require(e.status == Status.FUNDED, "Funds already handled");

        e.status = Status.RELEASED;
        payable(e.receiver).transfer(e.amount);

        emit FundsReleased(_id);
    }

    function refundFunds(uint256 _id) public {
        Escrow storage e = escrows[_id];
        require(msg.sender == e.receiver || msg.sender == e.sender, "Unauthorized");
        require(e.status == Status.FUNDED, "Funds already handled");
        
        // Simple refund logic: for production, this would involve a dispute period or mutual agreement
        e.status = Status.REFUNDED;
        payable(e.sender).transfer(e.amount);

        emit FundsRefunded(_id);
    }
}
