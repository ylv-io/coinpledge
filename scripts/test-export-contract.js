const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const { exportContract } = require('./export-contract');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'coinpledge-export-test-'));
const compiled = {
  abi: [{ type: 'function', name: 'read', stateMutability: 'view' },
    { type: 'function', name: 'pay', stateMutability: 'payable' }],
  bytecode: { object: '0x6001' },
  deployedBytecode: { object: '0x6002' },
  metadata: { compiler: { version: '0.8.37' } },
};
let code = compiled.deployedBytecode.object;
const server = http.createServer((request, response) => {
  let body = '';
  request.on('data', (chunk) => { body += chunk; });
  request.on('end', () => {
    const { method } = JSON.parse(body);
    response.end(JSON.stringify({ jsonrpc: '2.0', id: 1, result: method === 'net_version' ? '31337' : code }));
  });
});

const removeDirectory = (dir) => {
  fs.readdirSync(dir).forEach((name) => {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) removeDirectory(file);
    else fs.unlinkSync(file);
  });
  fs.rmdirSync(dir);
};

const run = async () => {
  fs.mkdirSync(path.join(directory, 'out/CoinPledge.sol'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'deployments'));
  fs.writeFileSync(path.join(directory, 'out/CoinPledge.sol/CoinPledge.json'), JSON.stringify(compiled));
  const manifest = path.join(directory, 'deployments/CoinPledge.json');
  fs.writeFileSync(manifest, '{}');
  const fresh = await exportContract([], directory);
  assert.deepStrictEqual(fresh.networks, {});
  assert.strictEqual(fresh.abi[0].constant, true);
  assert.strictEqual(fresh.abi[1].payable, true);
  await assert.rejects(exportContract(['--address', '0x123'], directory), /supplied together/);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = '0x1111111111111111111111111111111111111111';
  const args = ['--rpc-url', `http://127.0.0.1:${server.address().port}`, '--address', address];
  const deployed = await exportContract(args, directory);
  assert.strictEqual(deployed.networks['31337'].address, address);
  const before = fs.readFileSync(manifest, 'utf8');
  const artifactFile = path.join(directory, 'build/contracts/CoinPledge.json');
  const artifactBefore = fs.readFileSync(artifactFile, 'utf8');
  await exportContract([], directory);
  assert.strictEqual(fs.readFileSync(artifactFile, 'utf8'), artifactBefore);
  code = '0x';
  await assert.rejects(exportContract(args, directory), /does not match/);
  assert.strictEqual(fs.readFileSync(manifest, 'utf8'), before);
  assert.strictEqual(fs.readFileSync(artifactFile, 'utf8'), artifactBefore);
  fs.writeFileSync(manifest, JSON.stringify({ 1: { address, deployedBytecode: '0xold' } }));
  await assert.rejects(exportContract([], directory), /invalid or stale/);
  await assert.rejects(exportContract(['--unexpected', 'option'], directory), /Usage/);
  console.log('Artifact export checks passed: ABI compatibility, verified deployments, stale-address rejection, deterministic output.');
};

run().catch((error) => { console.error(error); process.exitCode = 1; }).then(() => {
  server.close();
  removeDirectory(directory);
});
