const CoinPledge = artifacts.require('./CoinPledge.sol');

module.exports = (deployer) => {
  deployer.deploy(CoinPledge);
};
