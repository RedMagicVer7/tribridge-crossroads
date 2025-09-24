const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Polygon Mainnet USDT address
  const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
  
  // Deploy RussiaEscrow contract
  const RussiaEscrow = await ethers.getContractFactory("RussiaEscrow");
  const russiaEscrow = await RussiaEscrow.deploy(USDT_ADDRESS);

  await russiaEscrow.waitForDeployment();

  console.log("RussiaEscrow deployed to:", await russiaEscrow.getAddress());

  // Setup initial roles
  const ARBITRATOR_ROLE = await russiaEscrow.ARBITRATOR_ROLE();
  const ORACLE_ROLE = await russiaEscrow.ORACLE_ROLE();

  // Add initial arbitrators (replace with actual addresses)
  const arbitrators = [
    "0x1234567890123456789012345678901234567890", // Replace with actual arbitrator addresses
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012"
  ];

  for (const arbitrator of arbitrators) {
    try {
      await russiaEscrow.addArbitrator(arbitrator);
      console.log(`Added arbitrator: ${arbitrator}`);
    } catch (error) {
      console.log(`Failed to add arbitrator ${arbitrator}:`, error.message);
    }
  }

  // Add initial oracle (replace with actual address)
  const oracle = "0x4567890123456789012345678901234567890123";
  try {
    await russiaEscrow.addOracle(oracle);
    console.log(`Added oracle: ${oracle}`);
  } catch (error) {
    console.log(`Failed to add oracle:`, error.message);
  }

  // Verify contract deployment info
  console.log("\n=== Deployment Summary ===");
  console.log(`Contract Address: ${await russiaEscrow.getAddress()}`);
  console.log(`USDT Token: ${USDT_ADDRESS}`);
  console.log(`Platform Fee Rate: ${await russiaEscrow.platformFeeRate()}`);
  console.log(`Total Orders Created: ${await russiaEscrow.totalOrdersCreated()}`);
  console.log("===============================");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: await russiaEscrow.getAddress(),
    usdtAddress: USDT_ADDRESS,
    deployer: deployer.address,
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    arbitrators: arbitrators,
    oracle: oracle
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`Deployment info saved to deployment-${hre.network.name}-${Date.now()}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });