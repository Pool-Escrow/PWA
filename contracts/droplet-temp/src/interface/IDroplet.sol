// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

interface IDroplet {
    error AccessControlBadConfirmation();
    error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);
    error ECDSAInvalidSignature();
    error ECDSAInvalidSignatureLength(uint256 length);
    error ECDSAInvalidSignatureS(bytes32 s);
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
    error ERC20InvalidApprover(address approver);
    error ERC20InvalidReceiver(address receiver);
    error ERC20InvalidSender(address sender);
    error ERC20InvalidSpender(address spender);
    error ERC2612ExpiredSignature(uint256 deadline);
    error ERC2612InvalidSigner(address signer, address owner);
    error InvalidAccountNonce(address account, uint256 currentNonce);
    error InvalidShortString();
    error StringTooLong(string str);

    event Approval(address indexed owner, address indexed spender, uint256 value);
    event EIP712DomainChanged();
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event StorageUpgraded(bytes32 oldStorageSlot, bytes32 newStorageSlot);
    event Transfer(address indexed from, address indexed to, uint256 value);

    function DEFAULT_ADMIN_ROLE() external view returns (bytes32);
    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external view returns (bytes32);
    function TOKEN_MANAGER_ROLE() external view returns (bytes32);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function balanceOf(address account, string memory slot_) external view returns (uint256);
    function burn(address from, uint256 value) external;
    function decimals() external view returns (uint8);
    function eip712Domain()
        external
        view
        returns (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainId,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        );
    function getRoleAdmin(bytes32 role) external view returns (bytes32);
    function grantRole(bytes32 role, address account) external;
    function hasRole(bytes32 role, address account) external view returns (bool);
    function mint(address to, uint256 value) external;
    function name() external view returns (string memory);
    function nonces(address owner) external view returns (uint256);
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)
        external;
    function renounceRole(bytes32 role, address callerConfirmation) external;
    function revokeRole(bytes32 role, address account) external;
    function storageSlot() external view returns (bytes32);
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
    function symbol() external view returns (string memory);
    function totalSupply() external view returns (uint256);
    function totalSupply(string memory slot_) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function upgradeStorage(string memory slot_) external;
}
