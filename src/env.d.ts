declare module '$contract' {
  const artifact: import('./lib/contract').ContractArtifact;
  export default artifact;
}
interface Window {
  ethereum?: import('./lib/contract').Provider;
}
