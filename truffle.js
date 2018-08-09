var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "pipe observe below demand join clump enough book inner pool power hungry";


module.exports = {
    networks: {
        dev: {
                host: "127.0.0.1",
                port: 7545,
                network_id: "*"
            },
        ropsten: {
                provider: function() {
                    return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/2ZODJ6T7eeMAaaJFPi4E");
                },
                network_id: 3,
                gas: 4712388, // Gas limit used for deploys
                gasPrice: 20000000000, // 20 gwei
            },
        main: {
                provider: function() {
                    return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/2ZODJ6T7eeMAaaJFPi4E");
                },
                network_id: 1,
                gasPrice: 11000000000, // 11 gwei
                gas: 4712357
            }
        },
};
