import hre from "hardhat";

describe("Add children", () => {
  let VaccinationManager, vaacinationManager;
  let owner, addr1;

  beforeEach(async () => {
    console.log("start");
    [owner, addr1] = await hre.ethers.getSigners();

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

  it("should", async () => {
    // 자식의 정보를 리턴하는 함수
    const printChildInfromation = async (signer, signerName) => {
      const childInformation = await vaacinationManager
        .connect(signer)
        .returnChildInformation();

      console.log(`-------${signerName}의 자식 정보-------`);
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
    };

    // 자식 추가 테스트 코드
    await vaacinationManager.addChild("갑", 20230403);
    await vaacinationManager.addChild("을", 20240104);

    // 갑이 생성한 주소를 가져온다고 하자.
    const child1_address = await vaacinationManager
      .connect(owner)
      .returnChildAddress("갑");

    // addr1 또한 갑, 을, 병의 부모이다.
    // 일단은 첫째인 값의 정보를 먼저 동기화
    // 테스트 완료
    const vaccinationManagementAddr1 = vaacinationManager.connect(addr1);
    await vaccinationManagementAddr1.linkChildToParent(child1_address);
    console.log("addr1이 갑의 주소를 통해서 자식과 연동을 하였습니다.");

    await printChildInfromation(owner, "owner");
    await printChildInfromation(addr1, "addr1");

    // 백신 업데이트 테스트 코드 (갑이 백신읆 맞은 경우)
    console.log("갑이 백신을 맞습니다.");
    await vaacinationManager.updateChildVaccination("갑", "vaccine1");
    console.log("갑의 백신예방 접종이 완료되었습니다.");

    await printChildInfromation();
  });
});
