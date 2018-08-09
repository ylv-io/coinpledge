var CoinPledge = artifacts.require("./CoinPledge.sol");

module.exports = function(deployer) {
  deployer.deploy(CoinPledge);
};

