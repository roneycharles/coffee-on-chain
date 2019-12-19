var coffeeContract = artifacts.require("./CoffeeOnChain.sol");

module.exports = function(deployer) {
  deployer.deploy(coffeeContract);
};
