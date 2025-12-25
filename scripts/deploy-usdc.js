const hre = require('hardhat')

async function main() {
  const USDC = await hre.ethers.getContractFactory('USDC')
  const initialSupply = 1_000_000n 
  const usdc = await USDC.deploy(initialSupply)
  await usdc.deployed()
  console.log('USDC deployed to:', usdc.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
