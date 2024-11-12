import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const healthContractAddress = "0x1294bF208e2CE8F7C92F362a83f4D28E47e55CF9";
  const medicalHistoryContractAddress =
    "0x91f2402EA971c7a95cC294F052d37d543eaF1944";
  const vaccinationContractAddress =
    "0x1317dcAdcfe99410c43a2D1980554cBf5f3FDf28";
  const parentChildRelationshipContractAddress =
    "0x61f019Da7b14683f2Af4454a080736d47Eb0Cb33";

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
