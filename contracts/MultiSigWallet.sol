// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MultiSigWallet
 * @dev 多签钱包合约，用于仲裁和争议处理
 * 支持多种代币的冷存储和多签操作
 */
contract MultiSigWallet is ReentrancyGuard, AccessControl, Pausable {
    
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    // 事件
    event TransactionProposed(
        uint256 indexed txId,
        address indexed proposer,
        address indexed to,
        uint256 value,
        address token,
        bytes data,
        string reason
    );
    
    event TransactionApproved(
        uint256 indexed txId,
        address indexed approver
    );
    
    event TransactionExecuted(
        uint256 indexed txId,
        address indexed executor,
        bool success
    );
    
    event TransactionCancelled(
        uint256 indexed txId,
        address indexed canceller,
        string reason
    );
    
    event ArbitratorAdded(address indexed arbitrator);
    event ArbitratorRemoved(address indexed arbitrator);
    event RequiredApprovalsChanged(uint256 oldRequired, uint256 newRequired);
    
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed escrowOrderId,
        address indexed initiator,
        string reason
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        address indexed resolver,
        bool favorBuyer,
        string resolution
    );

    // 交易结构
    struct Transaction {
        uint256 id;
        address proposer;
        address to;
        uint256 value;
        address token;           // ERC20代币地址，ETH为零地址
        bytes data;
        string reason;
        bool executed;
        bool cancelled;
        uint256 proposedAt;
        uint256 executedAt;
        mapping(address => bool) approvals;
        uint256 approvalCount;
    }

    // 争议结构
    struct Dispute {
        uint256 id;
        uint256 escrowOrderId;
        address initiator;
        address buyer;
        address seller;
        uint256 amount;
        address token;
        string reason;
        bool resolved;
        address resolver;
        bool favorBuyer;
        string resolution;
        uint256 createdAt;
        uint256 resolvedAt;
        mapping(address => bool) votes;
        uint256 voteCount;
    }

    // 状态变量
    uint256 public nextTxId = 1;
    uint256 public nextDisputeId = 1;
    uint256 public requiredApprovals;
    uint256 public totalArbitrators;
    
    // 超时设置
    uint256 public constant TRANSACTION_TIMEOUT = 7 days;
    uint256 public constant DISPUTE_TIMEOUT = 14 days;
    uint256 public constant EMERGENCY_DELAY = 24 hours;
    
    // 映射
    mapping(uint256 => Transaction) public transactions;
    mapping(uint256 => Dispute) public disputes;
    mapping(address => bool) public isArbitrator;
    mapping(address => uint256) public lastActivity;
    
    // 支持的代币
    mapping(address => bool) public supportedTokens;
    address[] public tokenList;
    
    // 紧急状态
    bool public emergencyMode = false;
    uint256 public emergencyActivatedAt;
    
    modifier onlyArbitrator() {
        require(isArbitrator[msg.sender], "Not an arbitrator");
        _;
    }
    
    modifier validTransaction(uint256 _txId) {
        require(_txId > 0 && _txId < nextTxId, "Invalid transaction ID");
        require(!transactions[_txId].executed, "Transaction already executed");
        require(!transactions[_txId].cancelled, "Transaction cancelled");
        _;
    }
    
    modifier validDispute(uint256 _disputeId) {
        require(_disputeId > 0 && _disputeId < nextDisputeId, "Invalid dispute ID");
        require(!disputes[_disputeId].resolved, "Dispute already resolved");
        _;
    }
    
    modifier notInEmergency() {
        require(!emergencyMode, "Contract in emergency mode");
        _;
    }

    constructor(
        address[] memory _arbitrators,
        uint256 _requiredApprovals,
        address[] memory _supportedTokens
    ) {
        require(_arbitrators.length >= 3, "Need at least 3 arbitrators");
        require(_requiredApprovals > 0 && _requiredApprovals <= _arbitrators.length, "Invalid required approvals");
        require(_requiredApprovals >= (_arbitrators.length * 60 / 100), "Required approvals too low"); // 至少60%
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // 添加仲裁员
        for (uint256 i = 0; i < _arbitrators.length; i++) {
            require(_arbitrators[i] != address(0), "Invalid arbitrator address");
            isArbitrator[_arbitrators[i]] = true;
            _grantRole(ARBITRATOR_ROLE, _arbitrators[i]);
            emit ArbitratorAdded(_arbitrators[i]);
        }
        
        totalArbitrators = _arbitrators.length;
        requiredApprovals = _requiredApprovals;
        
        // 添加支持的代币
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            if (!supportedTokens[_supportedTokens[i]]) {
                supportedTokens[_supportedTokens[i]] = true;
                tokenList.push(_supportedTokens[i]);
            }
        }
        
        // 支持ETH (零地址)
        supportedTokens[address(0)] = true;
        tokenList.push(address(0));
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {
        // 记录接收ETH
    }

    /**
     * @dev 提议交易
     */
    function proposeTransaction(
        address _to,
        uint256 _value,
        address _token,
        bytes memory _data,
        string memory _reason
    ) external onlyArbitrator notInEmergency returns (uint256) {
        require(_to != address(0), "Invalid recipient");
        require(supportedTokens[_token], "Token not supported");
        require(bytes(_reason).length > 0, "Reason required");
        
        uint256 txId = nextTxId++;
        Transaction storage txn = transactions[txId];
        
        txn.id = txId;
        txn.proposer = msg.sender;
        txn.to = _to;
        txn.value = _value;
        txn.token = _token;
        txn.data = _data;
        txn.reason = _reason;
        txn.proposedAt = block.timestamp;
        
        // 提议者自动批准
        txn.approvals[msg.sender] = true;
        txn.approvalCount = 1;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit TransactionProposed(txId, msg.sender, _to, _value, _token, _data, _reason);
        emit TransactionApproved(txId, msg.sender);
        
        return txId;
    }

    /**
     * @dev 批准交易
     */
    function approveTransaction(uint256 _txId) 
        external 
        onlyArbitrator 
        validTransaction(_txId) 
        notInEmergency 
    {
        Transaction storage txn = transactions[_txId];
        require(!txn.approvals[msg.sender], "Already approved");
        require(block.timestamp <= txn.proposedAt + TRANSACTION_TIMEOUT, "Transaction expired");
        
        txn.approvals[msg.sender] = true;
        txn.approvalCount++;
        
        lastActivity[msg.sender] = block.timestamp;
        
        emit TransactionApproved(_txId, msg.sender);
        
        // 如果达到所需批准数，自动执行
        if (txn.approvalCount >= requiredApprovals) {
            _executeTransaction(_txId);
        }
    }

    /**
     * @dev 执行交易
     */
    function executeTransaction(uint256 _txId) 
        external 
        onlyArbitrator 
        validTransaction(_txId) 
        nonReentrant 
    {
        Transaction storage txn = transactions[_txId];
        require(txn.approvalCount >= requiredApprovals, "Insufficient approvals");
        require(block.timestamp <= txn.proposedAt + TRANSACTION_TIMEOUT, "Transaction expired");
        
        _executeTransaction(_txId);
    }

    /**
     * @dev 内部执行交易
     */
    function _executeTransaction(uint256 _txId) internal {
        Transaction storage txn = transactions[_txId];
        
        txn.executed = true;
        txn.executedAt = block.timestamp;
        
        bool success = false;
        
        if (txn.token == address(0)) {
            // ETH转账
            require(address(this).balance >= txn.value, "Insufficient ETH balance");
            (success, ) = txn.to.call{value: txn.value}(txn.data);
        } else {
            // ERC20代币转账
            IERC20 token = IERC20(txn.token);
            require(token.balanceOf(address(this)) >= txn.value, "Insufficient token balance");
            success = token.transfer(txn.to, txn.value);
        }
        
        emit TransactionExecuted(_txId, msg.sender, success);
        
        if (!success) {
            txn.executed = false; // 回滚执行状态
            revert("Transaction execution failed");
        }
    }

    /**
     * @dev 取消交易
     */
    function cancelTransaction(uint256 _txId, string memory _reason) 
        external 
        onlyArbitrator 
        validTransaction(_txId) 
    {
        Transaction storage txn = transactions[_txId];
        require(
            msg.sender == txn.proposer || 
            hasRole(ADMIN_ROLE, msg.sender) ||
            block.timestamp > txn.proposedAt + TRANSACTION_TIMEOUT,
            "Cannot cancel"
        );
        
        txn.cancelled = true;
        
        emit TransactionCancelled(_txId, msg.sender, _reason);
    }

    /**
     * @dev 创建争议
     */
    function createDispute(
        uint256 _escrowOrderId,
        address _buyer,
        address _seller,
        uint256 _amount,
        address _token,
        string memory _reason
    ) external onlyArbitrator returns (uint256) {
        require(_buyer != address(0) && _seller != address(0), "Invalid addresses");
        require(_amount > 0, "Invalid amount");
        require(supportedTokens[_token], "Token not supported");
        require(bytes(_reason).length > 0, "Reason required");
        
        uint256 disputeId = nextDisputeId++;
        Dispute storage dispute = disputes[disputeId];
        
        dispute.id = disputeId;
        dispute.escrowOrderId = _escrowOrderId;
        dispute.initiator = msg.sender;
        dispute.buyer = _buyer;
        dispute.seller = _seller;
        dispute.amount = _amount;
        dispute.token = _token;
        dispute.reason = _reason;
        dispute.createdAt = block.timestamp;
        
        emit DisputeCreated(disputeId, _escrowOrderId, msg.sender, _reason);
        
        return disputeId;
    }

    /**
     * @dev 仲裁员投票解决争议
     */
    function voteOnDispute(uint256 _disputeId, bool _favorBuyer) 
        external 
        onlyArbitrator 
        validDispute(_disputeId) 
    {
        Dispute storage dispute = disputes[_disputeId];
        require(!dispute.votes[msg.sender], "Already voted");
        require(block.timestamp <= dispute.createdAt + DISPUTE_TIMEOUT, "Dispute expired");
        
        dispute.votes[msg.sender] = true;
        dispute.voteCount++;
        
        lastActivity[msg.sender] = block.timestamp;
        
        // 如果达到所需投票数，自动解决争议
        if (dispute.voteCount >= requiredApprovals) {
            _resolveDispute(_disputeId, _favorBuyer, "Multi-signature arbitration decision");
        }
    }

    /**
     * @dev 解决争议
     */
    function resolveDispute(
        uint256 _disputeId, 
        bool _favorBuyer, 
        string memory _resolution
    ) external onlyRole(ADMIN_ROLE) validDispute(_disputeId) {
        _resolveDispute(_disputeId, _favorBuyer, _resolution);
    }

    /**
     * @dev 内部解决争议
     */
    function _resolveDispute(
        uint256 _disputeId, 
        bool _favorBuyer, 
        string memory _resolution
    ) internal {
        Dispute storage dispute = disputes[_disputeId];
        
        dispute.resolved = true;
        dispute.resolver = msg.sender;
        dispute.favorBuyer = _favorBuyer;
        dispute.resolution = _resolution;
        dispute.resolvedAt = block.timestamp;
        
        // 执行资金转移
        address recipient = _favorBuyer ? dispute.buyer : dispute.seller;
        
        if (dispute.token == address(0)) {
            require(address(this).balance >= dispute.amount, "Insufficient ETH balance");
            (bool success, ) = recipient.call{value: dispute.amount}("");
            require(success, "ETH transfer failed");
        } else {
            IERC20 token = IERC20(dispute.token);
            require(token.balanceOf(address(this)) >= dispute.amount, "Insufficient token balance");
            require(token.transfer(recipient, dispute.amount), "Token transfer failed");
        }
        
        emit DisputeResolved(_disputeId, msg.sender, _favorBuyer, _resolution);
    }

    /**
     * @dev 添加仲裁员
     */
    function addArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        require(_arbitrator != address(0), "Invalid address");
        require(!isArbitrator[_arbitrator], "Already an arbitrator");
        
        isArbitrator[_arbitrator] = true;
        totalArbitrators++;
        _grantRole(ARBITRATOR_ROLE, _arbitrator);
        
        emit ArbitratorAdded(_arbitrator);
    }

    /**
     * @dev 移除仲裁员
     */
    function removeArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        require(isArbitrator[_arbitrator], "Not an arbitrator");
        require(totalArbitrators > 3, "Cannot have less than 3 arbitrators");
        
        isArbitrator[_arbitrator] = false;
        totalArbitrators--;
        _revokeRole(ARBITRATOR_ROLE, _arbitrator);
        
        // 如果所需批准数过高，调整
        if (requiredApprovals > totalArbitrators) {
            uint256 newRequired = (totalArbitrators * 60) / 100; // 60%
            if (newRequired == 0) newRequired = 1;
            _setRequiredApprovals(newRequired);
        }
        
        emit ArbitratorRemoved(_arbitrator);
    }

    /**
     * @dev 设置所需批准数
     */
    function setRequiredApprovals(uint256 _required) external onlyRole(ADMIN_ROLE) {
        _setRequiredApprovals(_required);
    }

    /**
     * @dev 内部设置所需批准数
     */
    function _setRequiredApprovals(uint256 _required) internal {
        require(_required > 0 && _required <= totalArbitrators, "Invalid required approvals");
        require(_required >= (totalArbitrators * 60 / 100), "Required approvals too low");
        
        uint256 oldRequired = requiredApprovals;
        requiredApprovals = _required;
        
        emit RequiredApprovalsChanged(oldRequired, _required);
    }

    /**
     * @dev 添加支持的代币
     */
    function addSupportedToken(address _token) external onlyRole(ADMIN_ROLE) {
        require(!supportedTokens[_token], "Token already supported");
        
        supportedTokens[_token] = true;
        tokenList.push(_token);
    }

    /**
     * @dev 激活紧急模式
     */
    function activateEmergencyMode() external onlyRole(ADMIN_ROLE) {
        emergencyMode = true;
        emergencyActivatedAt = block.timestamp;
        _pause();
    }

    /**
     * @dev 停用紧急模式
     */
    function deactivateEmergencyMode() external onlyRole(ADMIN_ROLE) {
        require(emergencyMode, "Not in emergency mode");
        require(block.timestamp >= emergencyActivatedAt + EMERGENCY_DELAY, "Emergency delay not met");
        
        emergencyMode = false;
        emergencyActivatedAt = 0;
        _unpause();
    }

    /**
     * @dev 获取交易详情
     */
    function getTransaction(uint256 _txId) external view returns (
        address proposer,
        address to,
        uint256 value,
        address token,
        bytes memory data,
        string memory reason,
        bool executed,
        bool cancelled,
        uint256 approvalCount,
        uint256 proposedAt
    ) {
        Transaction storage txn = transactions[_txId];
        return (
            txn.proposer,
            txn.to,
            txn.value,
            txn.token,
            txn.data,
            txn.reason,
            txn.executed,
            txn.cancelled,
            txn.approvalCount,
            txn.proposedAt
        );
    }

    /**
     * @dev 检查是否已批准交易
     */
    function hasApproved(uint256 _txId, address _arbitrator) external view returns (bool) {
        return transactions[_txId].approvals[_arbitrator];
    }

    /**
     * @dev 获取争议详情
     */
    function getDispute(uint256 _disputeId) external view returns (
        uint256 escrowOrderId,
        address initiator,
        address buyer,
        address seller,
        uint256 amount,
        address token,
        string memory reason,
        bool resolved,
        address resolver,
        bool favorBuyer,
        string memory resolution,
        uint256 voteCount
    ) {
        Dispute storage dispute = disputes[_disputeId];
        return (
            dispute.escrowOrderId,
            dispute.initiator,
            dispute.buyer,
            dispute.seller,
            dispute.amount,
            dispute.token,
            dispute.reason,
            dispute.resolved,
            dispute.resolver,
            dispute.favorBuyer,
            dispute.resolution,
            dispute.voteCount
        );
    }

    /**
     * @dev 获取支持的代币列表
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * @dev 获取钱包余额
     */
    function getBalance(address _token) external view returns (uint256) {
        if (_token == address(0)) {
            return address(this).balance;
        } else {
            return IERC20(_token).balanceOf(address(this));
        }
    }
}