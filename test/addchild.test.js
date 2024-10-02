import hre from "hardhat";

describe("Add children", () => {
  let VaccinationManager, vaacinationManager;
  let owner;

  beforeEach(async () => {
    console.log("start");
    [owner] = await hre.ethers.getSigners();

    VaccinationManager = await hre.ethers.getContractFactory(
      "VaccinationManagement"
    );

    // 배포시 인자
    vaacinationManager = await VaccinationManager.deploy();
    await vaacinationManager.waitForDeployment();
    console.log("컨트랙트 배포가 완료 되었습니다.");
    console.log("처음 배포자 : ", owner.address);
    console.log("컨트랙트 주소 : ", await vaacinationManager.getAddress());
  });

  it("should deploy the VaccinationManager contract", async () => {
    console.log("Test case executed.");
  });

  it("should Add child", async () => {
    await vaacinationManager.addChild("갑", 20240928);
    await vaacinationManager.addChild("을", 20240928);
    await vaacinationManager.addChild("병", 20240928);
    const childInformation = await vaacinationManager.returnChildInformation();

    console.log(await vaacinationManager._getTodayDate());

    console.log("-------자식 정보 추출-------");
    for (let index = 0; index < childInformation.length; index++) {
      console.log("자식 주소 : ", childInformation[index].childAddress);
      console.log("자식 이름 : ", childInformation[index].name);
      console.log("자식 생년월일 : ", childInformation[index].birthDate);
      console.log("자식 개월 수 : ", childInformation[index].babyMonth);

      console.log("자식 백신정보");
      for (
        let index2 = 0;
        index2 < childInformation[index].vaccinations.length;
        index2++
      ) {
        console.log(
          `${index2 + 1}. `,
          childInformation[index].vaccinations[index2]
        );
      }

      console.log("--------------------");
    }
  });
});
