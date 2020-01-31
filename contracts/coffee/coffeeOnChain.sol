pragma solidity >=0.4.24 <0.6.0;

import "../utils/SafeMath.sol";
import "../roles/Ownable.sol";
import "../roles/Manageable.sol";

contract CoffeeOnChain is Ownable, ManageableContract {
  using SafeMath for uint256;

  event PaymentReceived(
    address indexed from,
    bytes32 indexed machineId,
    uint256 productIndex,
    uint256 amountTRX,
    uint256 realRatio,
    uint256 amountReal
  );
  event Withdraw(address indexed owner, uint256 amount);
  event ResetCounter(bytes32 indexed machineId, uint256 index, uint256 counter);

  uint256 realRatio;

  /**
    * TODO:
    * - Add referals
    * - Add fees
    */

  struct Porduct {
    string name;
    uint256 price;
    bool useRealRatio;
    bool enable;
    uint256 counter;
  }

  struct Machine {
    bytes32 id;
    address manager;
    string name;
  }

  mapping(bytes32 => Machine) private _machines;
  mapping(bytes32 => Porduct[]) private _machinesProducts;
  mapping(address => uint256) private _balances;
  bytes32[] private machinesList;

  // Set Real/TRX ratio
  function setRealRatio(uint256 value) external onlyManagerContract returns(bool success) {
    require(value > 0, "Value cannot be zero");
    realRatio = value;
    return true;
  }

  // Return Real/TRX ratio
  function getRealRatio() external view returns(uint256 value) {
    return realRatio;
  }

  // Register new machine with name
  function registerMachine(string memory name) public returns(bytes32 id) {
    id = calcRegistrationId(msg.sender, name);
    require(_machines[id].id != id, "Already register");
    _machines[id] = Machine(id, msg.sender, name);
    machinesList.push(id);
    return id;
  }

  // Get count of machines in list
  function machineCounter() public view returns(uint256 counter) {
    return machinesList.length;
  }

  // Get machine ID/Total Products/Name by index
  function machineAt(uint256 index) external view returns(bytes32 id, uint256 productCounts, string memory name) {
    require(machineCounter() > index, "Index not found");
    return (machinesList[index], _machinesProducts[machinesList[index]].length, _machines[machinesList[index]].name);
  }

  // Get Total Products/Name by machine ID
  function machineAt(bytes32 id) external view returns(uint256 productCounts, string memory name) {
    require(_machines[id].id == id, "Machine not found");
    return (_machinesProducts[id].length, _machines[id].name);
  }

  // Get Product Price and Name by Machine ID and position index
  function getProductPriceAndName(bytes32 id, uint256 index) external view returns(
    string memory name,
    uint256 priceInTRX,
    uint256 priceInReal
  ) {
    (priceInTRX, priceInReal) = getPrice(id, index);
    return (_machinesProducts[id][index].name, priceInTRX, priceInReal);
  }

  // Get product price by Machine ID and position index
  function getPrice(bytes32 id, uint256 index) internal view returns(uint256 priceInTRX, uint256 priceInReal) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    uint256 price = _machinesProducts[id][index].price;
    if (_machinesProducts[id][index].useRealRatio) {
      priceInReal = price;
      priceInTRX = price.mul(realRatio);
    }else{
      priceInTRX = price;
      priceInReal = price.div(realRatio);
    }
  }

  // Set product price
  function adjustPrice(bytes32 id, uint256 index, uint256 newPrice, bool useRealRatio) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index].price = newPrice;
    _machinesProducts[id][index].useRealRatio = useRealRatio;
    return true;
  }

  // Add new product to machine
  function addProduct(bytes32 id, string calldata name, uint256 price, bool useRealRatio) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id].push(
      Porduct(
        name,
        price,
        useRealRatio,
        true,
        0
      ));
    return true;
  }

  // Delete machine product
  function deleteProduct(bytes32 id, uint256 index) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index] = _machinesProducts[id][_machinesProducts[id].length-1];
    delete _machinesProducts[id][_machinesProducts[id].length-1];
    _machinesProducts[id].length--;
    return true;
  }

  // Change product status
  function changeProductStatus(bytes32 id, uint256 index, bool enable) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index].enable = enable;
    return true;
  }

  // Change product name
  function changeProductName(bytes32 id, uint256 index, string calldata name) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index].name = name;
    return true;
  }

  // Reset product counter at machine ID/index
  function resetProductCounter(bytes32 id, uint256 index, string calldata name) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    emit ResetCounter(id, index, _machinesProducts[id][index].counter);
    _machinesProducts[id][index].counter = 0;    
    return true;
  }

  // Get product info at machine ID/index
  function getProduct(bytes32 id, uint256 index) external view returns(
    string memory name,
    uint256 price,
    bool useRealRatio,
    bool enable,
    uint256 counter
  ) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    return (
      _machinesProducts[id][index].name,
      _machinesProducts[id][index].price,
      _machinesProducts[id][index].useRealRatio,
      _machinesProducts[id][index].enable,
      _machinesProducts[id][index].counter
    );
  }

  // Withdraw available funds
  function withdraw() external returns(bool success, uint256 amount) {
    amount = _balances[msg.sender];
    if (amount > 0) {
      _balances[msg.sender] = 0;
      msg.sender.transfer(amount);
      emit Withdraw(msg.sender, amount);
      success = true;
    } else {
      success = false;
    }
  }

  // Pay a machine to buy the product at index
  function pay(bytes32 id, uint256 index) external payable returns(bool success) {
    (uint256 priceInTRX, uint256 priceInReal) = getPrice(id, index);
    require(msg.value == priceInTRX, "Price does not match");
    _machinesProducts[id][index].counter.add(1);
    _balances[_machines[id].manager].add(priceInTRX);
    emit PaymentReceived(msg.sender, id, index, priceInTRX, realRatio, priceInReal);
    return true;
  }

  function calcRegistrationId(address owner, string memory name) public pure returns(bytes32 id){
    return keccak256(abi.encodePacked(owner, name));
  }

}
