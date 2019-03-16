var OilPriceBet = artifacts.require("./OilPriceBet.sol");
var BatchSendEther = artifacts.require("./BatchSendEther.sol");

module.exports = function(deployer) {
  deployer.deploy(OilPriceBet);
  deployer.deploy(BatchSendEther);
};
