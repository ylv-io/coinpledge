const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const root = path.resolve(__dirname, '..');

const rpc = (url, method, params) => new Promise((resolve, reject) => {
  const payload = JSON.stringify({
    jsonrpc: '2.0', id: 1, method, params,
  });
  const endpoint = new URL(url);
  const transport = endpoint.protocol === 'https:' ? https : http;
  const request = transport.request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  }, (response) => {
    let body = '';
    response.on('data', (chunk) => { body += chunk; });
    response.on('error', reject);
    response.on('end', () => {
      try {
        if (response.statusCode !== 200) throw new Error(`RPC returned HTTP ${response.statusCode}`);
        const result = JSON.parse(body);
        if (result.error) throw new Error(`RPC ${method} failed`);
        resolve(result.result);
      } catch (error) { reject(error); }
    });
  });
  request.on('error', () => reject(new Error(`RPC ${method} connection failed`)));
  request.setTimeout(10000, () => request.destroy());
  request.end(payload);
});

const makeArtifact = (compiled, networks) => ({
  contractName: 'CoinPledge',
  abi: compiled.abi.map(entry => (entry.type === 'function' ? {
    ...entry,
    constant: entry.stateMutability === 'view' || entry.stateMutability === 'pure',
    payable: entry.stateMutability === 'payable',
  } : entry)),
  bytecode: compiled.bytecode.object,
  deployedBytecode: compiled.deployedBytecode.object,
  compiler: compiled.metadata.compiler,
  networks,
});

const exportContract = async (args, directory = root) => {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--rpc-url', '--address'].includes(args[i]) || !args[i + 1]) {
      throw new Error('Usage: node scripts/export-contract.js [--rpc-url URL --address ADDRESS]');
    }
    if (options[args[i]]) throw new Error(`Duplicate option: ${args[i]}`);
    options[args[i]] = args[i + 1];
  }
  if (!!options['--rpc-url'] !== !!options['--address']) {
    throw new Error('--rpc-url and --address must be supplied together');
  }
  const compiled = JSON.parse(fs.readFileSync(path.join(directory, 'out/CoinPledge.sol/CoinPledge.json'), 'utf8'));
  const manifestPath = path.join(directory, 'deployments/CoinPledge.json');
  const deployments = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const runtime = compiled.deployedBytecode.object.toLowerCase();

  if (options['--address']) {
    const address = options['--address'];
    if (!/^0x[0-9a-fA-F]{40}$/.test(address) || /^0x0{40}$/i.test(address)) {
      throw new Error('Provide a nonzero 20-byte contract address');
    }
    const [networkId, code] = await Promise.all([
      rpc(options['--rpc-url'], 'net_version', []),
      rpc(options['--rpc-url'], 'eth_getCode', [address, 'latest']),
    ]);
    if (!/^\d+$/.test(String(networkId))) throw new Error('RPC returned an invalid network ID');
    if (typeof code !== 'string' || code.toLowerCase() !== runtime) {
      throw new Error('Deployed bytecode does not match this Forge build; refusing to register the address');
    }
    deployments[networkId] = { address, deployedBytecode: runtime };
  }

  // Never attach a new ABI to a deployment of a different contract revision.
  const networks = {};
  Object.keys(deployments).sort().forEach((id) => {
    const deployment = deployments[id];
    if (!/^\d+$/.test(id) || !/^0x[0-9a-fA-F]{40}$/.test(deployment.address)
        || /^0x0{40}$/i.test(deployment.address) || deployment.deployedBytecode !== runtime) {
      throw new Error(`Deployment ${id} is invalid or stale. Redeploy and register it, or remove its manifest entry.`);
    }
    networks[id] = { address: deployment.address };
  });
  const artifact = makeArtifact(compiled, networks);
  fs.mkdirSync(path.join(directory, 'build/contracts'), { recursive: true });
  if (options['--address']) fs.writeFileSync(manifestPath, `${JSON.stringify(deployments, null, 2)}\n`);
  fs.writeFileSync(path.join(directory, 'build/contracts/CoinPledge.json'), `${JSON.stringify(artifact, null, 2)}\n`);
  return artifact;
};

if (require.main === module) {
  exportContract(process.argv.slice(2)).then(() => {
    console.log('Exported Forge artifact for the browser.');
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { exportContract };
