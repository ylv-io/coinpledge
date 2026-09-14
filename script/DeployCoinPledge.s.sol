// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {Script} from "forge-std/Script.sol";
import {CoinPledge} from "../contracts/CoinPledge.sol";

/// @notice Run with an explicit RPC URL and Foundry signer; no key is stored in this repository.
contract DeployCoinPledge is Script {
  function run() external returns (CoinPledge pledge) {
    vm.startBroadcast();
    pledge = new CoinPledge();
    vm.stopBroadcast();
  }
}
