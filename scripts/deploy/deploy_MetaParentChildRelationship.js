import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const healthContractAddress = "0xaA64C4124d214b6603a3aB326c9B25769d8daC9C";
  const medicalHistoryContractAddress =
    "0xD365bF78AB98D50e2180Ea6435Bb30679E9C4c8F";
  const vaccinationContractAddress =
    "0x728bfD90B7daB6E17E82Bbc54B28342045Cc05cA";

  console.log("Deploying account:", deployer.address);
  console.log(
    "Account balance:",
    await deployer.provider.getBalance(deployer.address)
  );

  const contract = await (
    await hre.ethers.getContractFactory("ParentChildRelationshipWithMeta")
  ).deploy(
    healthContractAddress,
    medicalHistoryContractAddress,
    vaccinationContractAddress
  );

  console.log(
    "예방 접종 컨트랙트가 배포되었습니다 : ",
    await contract.getAddress()
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
