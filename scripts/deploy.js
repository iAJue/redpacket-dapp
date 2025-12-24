const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Deploying RedPacket contract...');

  const RedPacket = await hre.ethers.getContractFactory('RedPacket');
  const redPacket = await RedPacket.deploy();
  await redPacket.deployed();

  console.log('RedPacket deployed to:', redPacket.address);

  const contractAddresses = {
    redPacket: redPacket.address,
  };

  const targetPath = path.resolve(__dirname, '..', 'dapp', 'src', 'config', 'contractAddresses.json');
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(contractAddresses, null, 2));

  console.log('Contract addresses saved to dapp/src/config/contractAddresses.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
