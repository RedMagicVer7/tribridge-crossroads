// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title RussiaEscrow
 * @dev 针对中俄贸易场景的智能合约托管系统
 * 支持卢布→USDT OTC兑换、物流验证、收货确认和资金释放
 */
contract RussiaEscrow is ReentrancyGuard, AccessControl, Pausable {
    
    // 角色定义
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // 支持的代币
    IERC20 public immutable USDT;
    
    // 订单状态枚举
    enum OrderStatus {
        Created,        // 已创建
        Funded,         // 已充值
        Shipped,        // 已发货
        Delivered,      // 已收货
        Completed,      // 已完成
        Disputed,       // 争议中
        Cancelled,      // 已取消
        Refunded        // 已退款
    }
    
    // 物流状态枚举
    enum LogisticsStatus {
        Pending,        // 待发货
        InTransit,      // 运输中
        Delivered,      // 已送达
        Failed          // 失败
    }
    
    // 订单结构
    struct Order {
        uint256 orderId;
        address buyer;              // 俄罗斯买方 (RusMach)
        address seller;             // 中国卖方 (ChinaEquip)
        uint256 amount;             // USDT 托管金额
        uint256 rubAmount;          // 卢布金额
        uint256 exchangeRate;       // 汇率 (RUB/USDT * 1e18)
        string goodsDescription;    // 货物描述
        string deliveryInfo;        // 物流信息
        OrderStatus status;
        LogisticsStatus logisticsStatus;
        uint256 createdAt;
        uint256 deliveryDeadline;   // 交货期限
        uint256 autoReleaseTime;    // 自动释放时间 (15天)
        string billOfLading;        // 提单哈希
        string trackingNumber;      // 物流追踪号
        bool isMultiSig;           // 是否多签订单
        address[] arbitrators;      // 仲裁员地址
    }
    
    // 争议结构
    struct Dispute {
        uint256 orderId;
        address initiator;
        string reason;
        uint256 createdAt;
        bool resolved;
        address resolver;
        string resolution;
    }
    
    // 物流验证结构
    struct LogisticsProof {
        string billOfLading;        // 提单
        string customsDeclaration;  // 报关单
        string insuranceCert;       // 保险凭证
        string trackingNumber;      // 追踪号
        uint256 timestamp;
        address verifier;
        bool verified;
    }
    
    // 状态变量
    uint256 public nextOrderId = 1;
    uint256 public platformFeeRate = 80; // 0.8% (80/10000)
    uint256 public constant MAX_FEE_RATE = 300; // 最大3%
    uint256 public constant AUTO_RELEASE_PERIOD = 15 days; // 自动释放期15天
    uint256 public constant DISPUTE_PERIOD = 7 days; // 争议期7天
    
    // 映射
    mapping(uint256 => Order) public orders;
    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => LogisticsProof) public logisticsProofs;
    mapping(address => uint256[]) public userOrders;
    mapping(uint256 => mapping(address => bool)) public arbitratorVotes;
    
    // 统计数据
    uint256 public totalOrdersCreated;
    uint256 public totalVolumeTraded;
    uint256 public totalFeesCollected;
    
    // 事件
    event OrderCreated(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 rubAmount
    );
    
    event OrderFunded(uint256 indexed orderId, uint256 amount);
    event OrderShipped(uint256 indexed orderId, string billOfLading, string trackingNumber);
    event OrderDelivered(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId, uint256 feeAmount);
    event OrderCancelled(uint256 indexed orderId, string reason);
    event DisputeRaised(uint256 indexed orderId, address indexed initiator, string reason);
    event DisputeResolved(uint256 indexed orderId, address indexed resolver, string resolution);
    event LogisticsVerified(uint256 indexed orderId, address indexed verifier);
    event FeeRateUpdated(uint256 oldRate, uint256 newRate);
    
    constructor(address _usdt) {
        USDT = IERC20(_usdt);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev 创建托管订单
     */
    function createOrder(
        address _seller,
        uint256 _amount,
        uint256 _rubAmount,
        uint256 _exchangeRate,
        string memory _goodsDescription,
        string memory _deliveryInfo,
        uint256 _deliveryDeadline,
        bool _isMultiSig,
        address[] memory _arbitrators
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(_seller != address(0), "Invalid seller address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_rubAmount > 0, "RUB amount must be greater than 0");
        require(_exchangeRate > 0, "Exchange rate must be greater than 0");
        require(_deliveryDeadline > block.timestamp, "Invalid delivery deadline");
        require(bytes(_goodsDescription).length > 0, "Goods description required");
        
        if (_isMultiSig) {
            require(_arbitrators.length >= 3, "At least 3 arbitrators required for multi-sig");
        }
        
        uint256 orderId = nextOrderId++;
        
        Order storage order = orders[orderId];
        order.orderId = orderId;
        order.buyer = msg.sender;
        order.seller = _seller;
        order.amount = _amount;
        order.rubAmount = _rubAmount;
        order.exchangeRate = _exchangeRate;
        order.goodsDescription = _goodsDescription;
        order.deliveryInfo = _deliveryInfo;
        order.status = OrderStatus.Created;
        order.logisticsStatus = LogisticsStatus.Pending;
        order.createdAt = block.timestamp;
        order.deliveryDeadline = _deliveryDeadline;
        order.autoReleaseTime = block.timestamp + AUTO_RELEASE_PERIOD;
        order.isMultiSig = _isMultiSig;
        order.arbitrators = _arbitrators;
        
        userOrders[msg.sender].push(orderId);
        userOrders[_seller].push(orderId);
        
        totalOrdersCreated++;
        
        emit OrderCreated(orderId, msg.sender, _seller, _amount, _rubAmount);
        
        return orderId;
    }
    
    /**
     * @dev 买方充值USDT到托管合约
     */
    function fundOrder(uint256 _orderId) external nonReentrant {
        Order storage order = orders[_orderId];
        require(order.buyer == msg.sender, "Only buyer can fund the order");
        require(order.status == OrderStatus.Created, "Order not in created status");
        
        require(
            USDT.transferFrom(msg.sender, address(this), order.amount),
            "USDT transfer failed"
        );
        
        order.status = OrderStatus.Funded;
        
        emit OrderFunded(_orderId, order.amount);
    }
    
    /**
     * @dev 卖方确认发货并上传物流信息
     */
    function confirmShipment(
        uint256 _orderId,
        string memory _billOfLading,
        string memory _trackingNumber,
        string memory _customsDeclaration,
        string memory _insuranceCert
    ) external {
        Order storage order = orders[_orderId];
        require(order.seller == msg.sender, "Only seller can confirm shipment");
        require(order.status == OrderStatus.Funded, "Order not funded");
        require(bytes(_billOfLading).length > 0, "Bill of lading required");
        require(bytes(_trackingNumber).length > 0, "Tracking number required");
        
        order.status = OrderStatus.Shipped;
        order.logisticsStatus = LogisticsStatus.InTransit;
        order.billOfLading = _billOfLading;
        order.trackingNumber = _trackingNumber;
        
        // 记录物流证明
        LogisticsProof storage proof = logisticsProofs[_orderId];
        proof.billOfLading = _billOfLading;
        proof.customsDeclaration = _customsDeclaration;
        proof.insuranceCert = _insuranceCert;
        proof.trackingNumber = _trackingNumber;
        proof.timestamp = block.timestamp;
        proof.verifier = msg.sender;
        
        emit OrderShipped(_orderId, _billOfLading, _trackingNumber);
    }
    
    /**
     * @dev 买方确认收货
     */
    function confirmDelivery(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.buyer == msg.sender, "Only buyer can confirm delivery");
        require(order.status == OrderStatus.Shipped, "Order not shipped");
        
        order.status = OrderStatus.Delivered;
        order.logisticsStatus = LogisticsStatus.Delivered;
        
        emit OrderDelivered(_orderId);
        
        // 自动释放资金
        _releaseOrder(_orderId);
    }
    
    /**
     * @dev 自动释放资金（15天后）
     */
    function autoReleaseOrder(uint256 _orderId) external {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Shipped, "Order not shipped");
        require(block.timestamp >= order.autoReleaseTime, "Auto release time not reached");
        
        order.status = OrderStatus.Delivered;
        order.logisticsStatus = LogisticsStatus.Delivered;
        
        emit OrderDelivered(_orderId);
        
        _releaseOrder(_orderId);
    }
    
    /**
     * @dev 内部函数：释放订单资金
     */
    function _releaseOrder(uint256 _orderId) internal {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Delivered, "Order not delivered");
        
        uint256 feeAmount = (order.amount * platformFeeRate) / 10000;
        uint256 sellerAmount = order.amount - feeAmount;
        
        order.status = OrderStatus.Completed;
        totalVolumeTraded += order.amount;
        totalFeesCollected += feeAmount;
        
        require(USDT.transfer(order.seller, sellerAmount), "Transfer to seller failed");
        
        emit OrderCompleted(_orderId, feeAmount);
    }
    
    /**
     * @dev 发起争议
     */
    function raiseDispute(uint256 _orderId, string memory _reason) external {
        Order storage order = orders[_orderId];
        require(
            order.buyer == msg.sender || order.seller == msg.sender,
            "Only order participants can raise dispute"
        );
        require(
            order.status == OrderStatus.Funded || 
            order.status == OrderStatus.Shipped,
            "Invalid order status for dispute"
        );
        require(bytes(_reason).length > 0, "Dispute reason required");
        
        order.status = OrderStatus.Disputed;
        
        Dispute storage dispute = disputes[_orderId];
        dispute.orderId = _orderId;
        dispute.initiator = msg.sender;
        dispute.reason = _reason;
        dispute.createdAt = block.timestamp;
        
        emit DisputeRaised(_orderId, msg.sender, _reason);
    }
    
    /**
     * @dev 仲裁员解决争议
     */
    function resolveDispute(
        uint256 _orderId,
        string memory _resolution,
        bool _favorBuyer
    ) external onlyRole(ARBITRATOR_ROLE) {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Disputed, "Order not in dispute");
        
        Dispute storage dispute = disputes[_orderId];
        require(!dispute.resolved, "Dispute already resolved");
        
        dispute.resolved = true;
        dispute.resolver = msg.sender;
        dispute.resolution = _resolution;
        
        if (_favorBuyer) {
            // 退款给买方
            order.status = OrderStatus.Refunded;
            require(USDT.transfer(order.buyer, order.amount), "Refund failed");
        } else {
            // 释放给卖方
            order.status = OrderStatus.Delivered;
            _releaseOrder(_orderId);
        }
        
        emit DisputeResolved(_orderId, msg.sender, _resolution);
    }
    
    /**
     * @dev 多签仲裁投票
     */
    function arbitratorVote(uint256 _orderId, bool _favorBuyer) external {
        Order storage order = orders[_orderId];
        require(order.isMultiSig, "Not a multi-sig order");
        require(order.status == OrderStatus.Disputed, "Order not in dispute");
        
        bool isArbitrator = false;
        for (uint i = 0; i < order.arbitrators.length; i++) {
            if (order.arbitrators[i] == msg.sender) {
                isArbitrator = true;
                break;
            }
        }
        require(isArbitrator, "Not an arbitrator for this order");
        require(!arbitratorVotes[_orderId][msg.sender], "Already voted");
        
        arbitratorVotes[_orderId][msg.sender] = true;
        
        // 检查投票结果（简单多数）
        uint256 voteCount = 0;
        for (uint i = 0; i < order.arbitrators.length; i++) {
            if (arbitratorVotes[_orderId][order.arbitrators[i]]) {
                voteCount++;
            }
        }
        
        if (voteCount > order.arbitrators.length / 2) {
            // 多数投票通过，执行决定
            resolveDispute(_orderId, "Multi-sig arbitration decision", _favorBuyer);
        }
    }
    
    /**
     * @dev Oracle验证物流信息
     */
    function verifyLogistics(
        uint256 _orderId,
        bool _verified
    ) external onlyRole(ORACLE_ROLE) {
        Order storage order = orders[_orderId];
        require(order.status == OrderStatus.Shipped, "Order not shipped");
        
        LogisticsProof storage proof = logisticsProofs[_orderId];
        proof.verified = _verified;
        proof.verifier = msg.sender;
        
        if (_verified) {
            emit LogisticsVerified(_orderId, msg.sender);
        }
    }
    
    /**
     * @dev 取消订单（仅限创建状态）
     */
    function cancelOrder(uint256 _orderId, string memory _reason) external {
        Order storage order = orders[_orderId];
        require(
            order.buyer == msg.sender || order.seller == msg.sender,
            "Only order participants can cancel"
        );
        require(order.status == OrderStatus.Created, "Can only cancel created orders");
        
        order.status = OrderStatus.Cancelled;
        
        emit OrderCancelled(_orderId, _reason);
    }
    
    /**
     * @dev 获取订单详情
     */
    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orders[_orderId];
    }
    
    /**
     * @dev 获取用户订单列表
     */
    function getUserOrders(address _user) external view returns (uint256[] memory) {
        return userOrders[_user];
    }
    
    /**
     * @dev 获取争议信息
     */
    function getDispute(uint256 _orderId) external view returns (Dispute memory) {
        return disputes[_orderId];
    }
    
    /**
     * @dev 获取物流证明
     */
    function getLogisticsProof(uint256 _orderId) external view returns (LogisticsProof memory) {
        return logisticsProofs[_orderId];
    }
    
    // 管理员功能
    function updatePlatformFeeRate(uint256 _newRate) external onlyRole(ADMIN_ROLE) {
        require(_newRate <= MAX_FEE_RATE, "Fee rate too high");
        uint256 oldRate = platformFeeRate;
        platformFeeRate = _newRate;
        emit FeeRateUpdated(oldRate, _newRate);
    }
    
    function withdrawFees() external onlyRole(ADMIN_ROLE) {
        uint256 balance = USDT.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(USDT.transfer(msg.sender, balance), "Fee withdrawal failed");
    }
    
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
    
    function addArbitrator(address _arbitrator) external onlyRole(ADMIN_ROLE) {
        grantRole(ARBITRATOR_ROLE, _arbitrator);
    }
    
    function addOracle(address _oracle) external onlyRole(ADMIN_ROLE) {
        grantRole(ORACLE_ROLE, _oracle);
    }
}