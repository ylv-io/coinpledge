// SPDX-License-Identifier: MIT
pragma solidity =0.8.37 ^0.8.20 ^0.8.24;

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/utils/TransientSlot.sol

// OpenZeppelin Contracts (last updated v5.3.0) (utils/TransientSlot.sol)
// This file was procedurally generated from scripts/generate/templates/TransientSlot.js.

/**
 * @dev Library for reading and writing value-types to specific transient storage slots.
 *
 * Transient slots are often used to store temporary values that are removed after the current transaction.
 * This library helps with reading and writing to such slots without the need for inline assembly.
 *
 *  * Example reading and writing values using transient storage:
 * ```solidity
 * contract Lock {
 *     using TransientSlot for *;
 *
 *     // Define the slot. Alternatively, use the SlotDerivation library to derive the slot.
 *     bytes32 internal constant _LOCK_SLOT = 0xf4678858b2b588224636b8522b729e7722d32fc491da849ed75b3fdf3c84f542;
 *
 *     modifier locked() {
 *         require(!_LOCK_SLOT.asBoolean().tload());
 *
 *         _LOCK_SLOT.asBoolean().tstore(true);
 *         _;
 *         _LOCK_SLOT.asBoolean().tstore(false);
 *     }
 * }
 * ```
 *
 * TIP: Consider using this library along with {SlotDerivation}.
 */
library TransientSlot {
    /**
     * @dev UDVT that represents a slot holding an address.
     */
    type AddressSlot is bytes32;

    /**
     * @dev Cast an arbitrary slot to a AddressSlot.
     */
    function asAddress(bytes32 slot) internal pure returns (AddressSlot) {
        return AddressSlot.wrap(slot);
    }

    /**
     * @dev UDVT that represents a slot holding a bool.
     */
    type BooleanSlot is bytes32;

    /**
     * @dev Cast an arbitrary slot to a BooleanSlot.
     */
    function asBoolean(bytes32 slot) internal pure returns (BooleanSlot) {
        return BooleanSlot.wrap(slot);
    }

    /**
     * @dev UDVT that represents a slot holding a bytes32.
     */
    type Bytes32Slot is bytes32;

    /**
     * @dev Cast an arbitrary slot to a Bytes32Slot.
     */
    function asBytes32(bytes32 slot) internal pure returns (Bytes32Slot) {
        return Bytes32Slot.wrap(slot);
    }

    /**
     * @dev UDVT that represents a slot holding a uint256.
     */
    type Uint256Slot is bytes32;

    /**
     * @dev Cast an arbitrary slot to a Uint256Slot.
     */
    function asUint256(bytes32 slot) internal pure returns (Uint256Slot) {
        return Uint256Slot.wrap(slot);
    }

    /**
     * @dev UDVT that represents a slot holding a int256.
     */
    type Int256Slot is bytes32;

    /**
     * @dev Cast an arbitrary slot to a Int256Slot.
     */
    function asInt256(bytes32 slot) internal pure returns (Int256Slot) {
        return Int256Slot.wrap(slot);
    }

    /**
     * @dev Load the value held at location `slot` in transient storage.
     */
    function tload(AddressSlot slot) internal view returns (address value) {
        assembly ("memory-safe") {
            value := tload(slot)
        }
    }

    /**
     * @dev Store `value` at location `slot` in transient storage.
     */
    function tstore(AddressSlot slot, address value) internal {
        assembly ("memory-safe") {
            tstore(slot, value)
        }
    }

    /**
     * @dev Load the value held at location `slot` in transient storage.
     */
    function tload(BooleanSlot slot) internal view returns (bool value) {
        assembly ("memory-safe") {
            value := tload(slot)
        }
    }

    /**
     * @dev Store `value` at location `slot` in transient storage.
     */
    function tstore(BooleanSlot slot, bool value) internal {
        assembly ("memory-safe") {
            tstore(slot, value)
        }
    }

    /**
     * @dev Load the value held at location `slot` in transient storage.
     */
    function tload(Bytes32Slot slot) internal view returns (bytes32 value) {
        assembly ("memory-safe") {
            value := tload(slot)
        }
    }

    /**
     * @dev Store `value` at location `slot` in transient storage.
     */
    function tstore(Bytes32Slot slot, bytes32 value) internal {
        assembly ("memory-safe") {
            tstore(slot, value)
        }
    }

    /**
     * @dev Load the value held at location `slot` in transient storage.
     */
    function tload(Uint256Slot slot) internal view returns (uint256 value) {
        assembly ("memory-safe") {
            value := tload(slot)
        }
    }

    /**
     * @dev Store `value` at location `slot` in transient storage.
     */
    function tstore(Uint256Slot slot, uint256 value) internal {
        assembly ("memory-safe") {
            tstore(slot, value)
        }
    }

    /**
     * @dev Load the value held at location `slot` in transient storage.
     */
    function tload(Int256Slot slot) internal view returns (int256 value) {
        assembly ("memory-safe") {
            value := tload(slot)
        }
    }

    /**
     * @dev Store `value` at location `slot` in transient storage.
     */
    function tstore(Int256Slot slot, int256 value) internal {
        assembly ("memory-safe") {
            tstore(slot, value)
        }
    }
}

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuardTransient.sol

// OpenZeppelin Contracts (last updated v5.5.0) (utils/ReentrancyGuardTransient.sol)

/**
 * @dev Variant of {ReentrancyGuard} that uses transient storage.
 *
 * NOTE: This variant only works on networks where EIP-1153 is available.
 *
 * _Available since v5.1._
 *
 * @custom:stateless
 */
abstract contract ReentrancyGuardTransient {
    using TransientSlot for *;

    // keccak256(abi.encode(uint256(keccak256("openzeppelin.storage.ReentrancyGuard")) - 1)) & ~bytes32(uint256(0xff))
    bytes32 private constant REENTRANCY_GUARD_STORAGE =
        0x9b779b17422d0df92223018b32b4d1fa46e071723d6817e2486d003becc55f00;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev A `view` only version of {nonReentrant}. Use to block view functions
     * from being called, preventing reading from inconsistent contract state.
     *
     * CAUTION: This is a "view" modifier and does not change the reentrancy
     * status. Use it only on view functions. For payable or non-payable functions,
     * use the standard {nonReentrant} modifier instead.
     */
    modifier nonReentrantView() {
        _nonReentrantBeforeView();
        _;
    }

    function _nonReentrantBeforeView() private view {
        if (_reentrancyGuardEntered()) {
            revert ReentrancyGuardReentrantCall();
        }
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, REENTRANCY_GUARD_STORAGE.asBoolean().tload() will be false
        _nonReentrantBeforeView();

        // Any calls to nonReentrant after this point will fail
        _reentrancyGuardStorageSlot().asBoolean().tstore(true);
    }

    function _nonReentrantAfter() private {
        _reentrancyGuardStorageSlot().asBoolean().tstore(false);
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _reentrancyGuardStorageSlot().asBoolean().tload();
    }

    function _reentrancyGuardStorageSlot() internal pure virtual returns (bytes32) {
        return REENTRANCY_GUARD_STORAGE;
    }
}

// lib/openzeppelin-contracts/contracts/access/Ownable2Step.sol

// OpenZeppelin Contracts (last updated v5.1.0) (access/Ownable2Step.sol)

/**
 * @dev Contract module which provides access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This extension of the {Ownable} contract includes a two-step mechanism to transfer
 * ownership, where the new owner must call {acceptOwnership} in order to replace the
 * old one. This can help prevent common mistakes, such as transfers of ownership to
 * incorrect accounts, or to contracts that are unable to interact with the
 * permission system.
 *
 * The initial owner is specified at deployment time in the constructor for `Ownable`. This
 * can later be changed with {transferOwnership} and {acceptOwnership}.
 *
 * This module is used through inheritance. It will make available all functions
 * from parent (Ownable).
 */
abstract contract Ownable2Step is Ownable {
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the pending owner.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @dev Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
     * Can only be called by the current owner.
     *
     * Setting `newOwner` to the zero address is allowed; this can be used to cancel an initiated ownership transfer.
     */
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`) and deletes any pending owner.
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual override {
        delete _pendingOwner;
        super._transferOwnership(newOwner);
    }

    /**
     * @dev The new owner accepts the ownership transfer.
     */
    function acceptOwnership() public virtual {
        address sender = _msgSender();
        if (pendingOwner() != sender) {
            revert OwnableUnauthorizedAccount(sender);
        }
        _transferOwnership(sender);
    }
}

// contracts/CoinPledge.sol

/// @title CoinPledge
/// @author Igor Yalovoy
/// @notice Stake ether on a goal judged by a registered mentor.
/// @dev New deployments only: storage is not compatible with the historical contract.
///      Settlement credits balances; recipients withdraw independently. Targets Osaka EVM.
contract CoinPledge is Ownable2Step, ReentrancyGuardTransient {
  uint256 public constant RESOLUTION_GRACE_PERIOD = 7 days;
  uint256 public constant MIN_STAKE = 0.01 ether;
  uint256 public constant MIN_BONUS = 0.001 ether;

  // Field order and the historical spelling of successed are part of the browser ABI.
  struct Challenge {
    address user;
    string name;
    uint256 value;
    address mentor;
    uint256 startDate;
    uint256 time;
    uint256 mentorFee;
    bool successed;
    bool resolved;
  }

  struct User {
    address addr;
    string name;
  }

  error GameHasEnded();
  error InvalidUsernameLength();
  error UserAlreadyRegistered();
  error UsernameTaken();
  error StakeTooSmall();
  error RewardExceedsStake();
  error UnknownMentor();
  error InvalidDuration();
  error SelfMentoring();
  error UnknownChallenge();
  error ChallengeAlreadyResolved();
  error UnauthorizedResolver();
  error NothingToWithdraw();
  error InvalidRecipient();
  error EtherTransferFailed();
  error OwnershipRenunciationDisabled();

  event NewChallenge(
    uint256 indexed challengeId,
    address indexed user,
    string name,
    uint256 value,
    address indexed mentor,
    uint256 startDate,
    uint256 time,
    uint256 mentorFee
  );
  event ChallengeResolved(
    uint256 indexed challengeId, address indexed user, address indexed mentor, bool decision
  );
  event BonusFundChanged(address indexed user, uint256 value);
  event NewUsername(address indexed addr, string name);
  event Donation(string name, string url, uint256 value, uint256 timestamp);
  event GameEnded();
  event PaymentAccrued(address indexed recipient, uint256 value);
  event PaymentWithdrawn(address indexed user, address indexed recipient, uint256 value);

  bool public isGameOver;
  Challenge[] public challenges;
  mapping(address => User) public users;
  address[] public allUsers;
  mapping(string => address) private usernameToAddress;
  mapping(address => uint256[]) private userChallenges;
  mapping(address => uint256[]) private mentorChallenges;

  /// @notice Failed stakes, locked until later success or shutdown.
  mapping(address => uint256) public bonusFund;
  /// @notice Settled payouts, fees and donations, withdrawable at any time.
  mapping(address => uint256) public pendingWithdrawals;

  constructor() Ownable(msg.sender) {}

  modifier gameIsNotOver() {
    if (isGameOver) revert GameHasEnded();
    _;
  }

  function getBonusFund(address user) external view returns (uint256) {
    return bonusFund[user];
  }

  function getUsersCount() external view returns (uint256) {
    return allUsers.length;
  }

  // Retain the original public lookup ABI without duplicating challenge storage.
  function challengeToUser(uint256 id) external view returns (address) {
    return id < challenges.length ? challenges[id].user : address(0);
  }

  function challengeToMentor(uint256 id) external view returns (address) {
    return id < challenges.length ? challenges[id].mentor : address(0);
  }

  function userToChallengeCount(address user) external view returns (uint256) {
    return userChallenges[user].length;
  }

  function mentorToChallengeCount(address mentor) external view returns (uint256) {
    return mentorChallenges[mentor].length;
  }

  /// @notice Return this user's IDs in creation order; an unknown user gets an empty array.
  function getChallengesForUser(address user) external view returns (uint256[] memory) {
    return userChallenges[user];
  }

  function getChallengesForMentor(address mentor) external view returns (uint256[] memory) {
    return mentorChallenges[mentor];
  }

  /// @notice Stop new activity permanently and unlock bonuses; existing challenges still settle.
  function gameOver() external onlyOwner gameIsNotOver {
    isGameOver = true;
    emit GameEnded();
  }

  /// @notice Ownership must remain available for shutdown and donation/service-fee attribution.
  function renounceOwnership() public view override onlyOwner {
    revert OwnershipRenunciationDisabled();
  }

  /// @notice Register a unique, immutable, case-sensitive name of 3 to 32 UTF-8 bytes.
  function setUsername(string calldata name) external gameIsNotOver {
    uint256 length = bytes(name).length;
    if (length < 3 || length > 32) revert InvalidUsernameLength();
    if (users[msg.sender].addr != address(0)) revert UserAlreadyRegistered();
    if (usernameToAddress[name] != address(0)) revert UsernameTaken();

    users[msg.sender] = User(msg.sender, name);
    usernameToAddress[name] = msg.sender;
    allUsers.push(msg.sender);
    emit NewUsername(msg.sender, name);
  }

  /// @param time Duration in seconds, not an absolute deadline.
  /// @param mentorFee Total reward in wei, including the 10% service fee.
  function createChallenge(
    string calldata name,
    string calldata mentor,
    uint256 time,
    uint256 mentorFee
  ) external payable gameIsNotOver returns (uint256 id) {
    if (msg.value < MIN_STAKE) revert StakeTooSmall();
    if (mentorFee > msg.value) revert RewardExceedsStake();
    address mentorAddr = usernameToAddress[mentor];
    if (mentorAddr == address(0)) revert UnknownMentor();
    if (mentorAddr == msg.sender) revert SelfMentoring();
    if (time == 0 || time > type(uint256).max - block.timestamp - RESOLUTION_GRACE_PERIOD) {
      revert InvalidDuration();
    }

    id = challenges.length;
    challenges.push(
      Challenge(
        msg.sender, name, msg.value, mentorAddr, block.timestamp, time, mentorFee, false, false
      )
    );
    userChallenges[msg.sender].push(id);
    mentorChallenges[mentorAddr].push(id);
    emit NewChallenge(id, msg.sender, name, msg.value, mentorAddr, block.timestamp, time, mentorFee);
  }

  /// @notice Mentors can settle at any time; users can also settle at deadline + seven days.
  /// @dev No external calls: a rejecting recipient cannot block settlement or other recipients.
  function resolveChallenge(uint256 challengeId, bool decision) external {
    if (challengeId >= challenges.length) revert UnknownChallenge();
    Challenge storage challenge = challenges[challengeId];
    if (challenge.resolved) revert ChallengeAlreadyResolved();
    if (
      msg.sender != challenge.mentor
        && (msg.sender != challenge.user
          || block.timestamp < challenge.startDate + challenge.time + RESOLUTION_GRACE_PERIOD)
    ) revert UnauthorizedResolver();

    challenge.successed = decision;
    challenge.resolved = true;

    // Assign every wei: floor 10% to owner, all reward remainder to the mentor.
    uint256 serviceFee = challenge.mentorFee / 10;
    uint256 remainingValue = challenge.value - challenge.mentorFee;
    if (decision) {
      uint256 currentBonus = bonusFund[challenge.user];
      uint256 bonus = currentBonus <= MIN_BONUS ? currentBonus : currentBonus / 2;
      if (bonus > 0) {
        bonusFund[challenge.user] = currentBonus - bonus;
        emit BonusFundChanged(challenge.user, currentBonus - bonus);
      }
      _credit(challenge.user, remainingValue + bonus);
    } else {
      bonusFund[challenge.user] += remainingValue;
      emit BonusFundChanged(challenge.user, bonusFund[challenge.user]);
    }

    _credit(challenge.mentor, challenge.mentorFee - serviceFee);
    _credit(owner(), serviceFee);
    emit ChallengeResolved(challengeId, challenge.user, challenge.mentor, decision);
  }

  /// @notice Includes unlocked bonus funds after shutdown.
  function withdrawableBalance(address user) public view returns (uint256) {
    return pendingWithdrawals[user] + (isGameOver ? bonusFund[user] : 0);
  }

  function withdraw() external nonReentrant {
    _withdraw(payable(msg.sender));
  }

  /// @notice Claim your own balance to another recipient, e.g. if your wallet rejects ETH.
  function withdrawTo(address payable recipient) external nonReentrant {
    if (recipient == address(0) || recipient == address(this)) revert InvalidRecipient();
    _withdraw(recipient);
  }

  /// @notice Credit the current owner's withdrawal balance without calling their wallet.
  function donate(string calldata name, string calldata url) external payable gameIsNotOver {
    _credit(owner(), msg.value);
    emit Donation(name, url, msg.value, block.timestamp);
  }

  function _credit(address recipient, uint256 value) private {
    if (value == 0) return;
    pendingWithdrawals[recipient] += value;
    emit PaymentAccrued(recipient, value);
  }

  function _withdraw(address payable recipient) private {
    uint256 funds = withdrawableBalance(msg.sender);
    if (funds == 0) revert NothingToWithdraw();
    pendingWithdrawals[msg.sender] = 0;
    if (isGameOver && bonusFund[msg.sender] > 0) {
      bonusFund[msg.sender] = 0;
      emit BonusFundChanged(msg.sender, 0);
    }
    emit PaymentWithdrawn(msg.sender, recipient, funds);
    (bool success,) = recipient.call{value: funds}("");
    if (!success) revert EtherTransferFailed();
  }
}
