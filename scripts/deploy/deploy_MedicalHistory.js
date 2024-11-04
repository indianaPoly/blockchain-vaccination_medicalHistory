import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying account:", deployer.address);
  console.log(
    "Account balance:",
    await deployer.provider.getBalance(deployer.address)
  );

  const contract = await (
    await hre.ethers.getContractFactory("MedicalHistory")
  ).deploy();

  console.log(
    "진료 내역 저장 컨트랙트가 배포되었습니다 : ",
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
