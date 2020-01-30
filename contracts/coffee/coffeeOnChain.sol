pragma solidity >=0.4.24 <0.6.0;

import "../utils/SafeMath.sol";
import "../roles/Ownable.sol";
import "../roles/Manageable.sol";

contract CoffeeOnChain is Ownable, ManageableContract {
  using SafeMath for uint256;

  event PaymentReceived(address indexed from, bytes32 machineId, uint256 productIndex, uint256 amount);
  event Withdraw(address indexed owner, uint256 amount);

  uint256 realRatio;

  /**
    * TODO:
    * - Add referals
    * - Add fees
    * - Add get produts by machine ID
    * - Return product price in REAL/TRX
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

  function setRealRatio(uint256 value) external onlyManagerContract returns(bool success) {
    require(value > 0, "Value cannot be zero");
    realRatio = value;
    return true;
  }

  function getRealRatio() external view returns(uint256 value) {
    return realRatio;
  }

  function registerMachine(string memory name) public returns(bytes32 id) {
    id = calcRegistrationId(msg.sender, name);
    require(_machines[id].id != id, "Already register");
    _machines[id] = Machine(id, msg.sender, name);
    machinesList.push(id);
    return id;
  }

  function machineCounter() public view returns(uint256 counter) {
    return machinesList.length;
  }

  function machineAt(uint256 index) external view returns(bytes32 id, uint256 productCounts) {
    require(machineCounter() > index, "Index not found");
    return (machinesList[index], _machinesProducts[machinesList[index]].length);
  }

  function getProductPriceAndName(bytes32 id, uint256 index) external view returns(string memory name, uint256 price) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    price = _machinesProducts[id][index].price;
    if (_machinesProducts[id][index].useRealRatio) {
      price = price.div(realRatio);
    }
    return (_machinesProducts[id][index].name, price);
  }

  function getPrice(bytes32 id, uint256 index) public view returns(uint256 price) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    price = _machinesProducts[id][index].price;
    if (_machinesProducts[id][index].useRealRatio) {
      price = price.div(realRatio);
    }
  }

  function adjustPrice(bytes32 id, uint256 index, uint256 newPrice, bool useRealRatio) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index].price = newPrice;
    _machinesProducts[id][index].useRealRatio = useRealRatio;
    return true;
  }

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

  function deleteProduct(bytes32 id, uint256 index) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index] = _machinesProducts[id][_machinesProducts[id].length-1];
    delete _machinesProducts[id][_machinesProducts[id].length-1];
    _machinesProducts[id].length--;
    return true;
  }

  function changeProductStatus(bytes32 id, uint256 index, bool enable) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index].enable = enable;
    return true;
  }

  function changeProductName(bytes32 id, uint256 index, string calldata name) external returns(bool success) {
    require(_machines[id].id == id, "Machine not found");
    require(_machinesProducts[id].length > index, "Machine product not found");
    require(_machines[id].manager == msg.sender, "Not machine owner");
    _machinesProducts[id][index].name = name;
    return true;
  }

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

  function pay(bytes32 id, uint256 index) external payable returns(bool success) {
    uint256 price = getPrice(id, index);
    require(msg.value == price, "Price does not match");
    _machinesProducts[id][index].counter.add(1);
    _balances[_machines[id].manager].add(price);
    emit PaymentReceived(msg.sender, id, index, price);
    return true;
  }

  function calcRegistrationId(address owner, string memory name) public pure returns(bytes32 id){
    return keccak256(abi.encodePacked(owner, name));
  }

}
