const hre = require("hardhat");

async function main() {
  console.log("Preparing deployment...\n");

  const AgroLedger = await hre.ethers.getContractFactory("AgroLedger");
  const agroLedger = await AgroLedger.deploy();
  await agroLedger.waitForDeployment();

  console.log(`✅ AgroLedger Contract Deployed!`);
  console.log(`Address: ${agroLedger.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });