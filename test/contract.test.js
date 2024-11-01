import hre from "hardhat";

describe("Contract Test - Parent-Child Relationship", () => {
  let ParentChildRelationship, parentChildRelationship;
  let HealthInformation, healthInformation;

  let owner, secondaryAddress;

  beforeEach(async () => {
    console.log("컨트랙트 배포를 시작합니다...\n");

    [owner, secondaryAddress] = await hre.ethers.getSigners();

    // 자녀 건강정보 컨트랙트를 먼저 배포
    console.log("자녀 건강정보 컨트랙트를 배포합니다...");
    HealthInformation = await hre.ethers.getContractFactory(
      "HealthInformation"
    );
    healthInformation = await HealthInformation.deploy();
    console.log("자녀 건강정보 컨트랙트가 성공적으로 배포되었습니다.");
    console.log(
      "자녀 건강정보 컨트랙트 주소:",
      await healthInformation.getAddress(),
      "\n"
    );

    // 부모-자녀 관계 컨트랙트를 배포
    console.log("부모-자녀 관계 컨트랙트를 배포합니다...");
    ParentChildRelationship = await hre.ethers.getContractFactory(
      "ParentChildRelationship"
    );
    parentChildRelationship = await ParentChildRelationship.deploy(
      await healthInformation.getAddress()
    );
    console.log("부모-자녀 관계 컨트랙트가 성공적으로 배포되었습니다.");
    console.log(
      "부모-자녀 관계 컨트랙트 주소:",
      await parentChildRelationship.getAddress(),
      "\n"
    );
  });

  it("should add and link children", async () => {
    // owner가 두 명의 자녀를 추가
    await parentChildRelationship.createChild(
      "Go Hyunlim",
      20231030,
      10.1 * 10,
      90.1 * 10
    );
    await parentChildRelationship.createChild(
      "Go Hwirim",
      20241010,
      10.1 * 10,
      90.1 * 10
    );
    console.log("자녀가 성공적으로 생성되었습니다.");

    // 첫 번째 부모(owner)에게 보이는 자녀 목록을 출력
    const ownerChildren =
      await parentChildRelationship.returnChildInformation();
    console.log("첫 번째 부모(owner)가 확인할 수 있는 자녀 정보:");
    console.log(ownerChildren);

    // 첫 번째 자녀(Go Hyunlim)의 주소를 가져옴
    const firstChildAddress = await parentChildRelationship
      .connect(owner)
      .returnChildAddress("Go Hyunlim");

    // 두 번째 주소(secondaryAddress)가 첫 번째 자녀와 연동
    await parentChildRelationship
      .connect(secondaryAddress)
      .connectChild(firstChildAddress);
    console.log("두 번째 주소와 자녀가 성공적으로 연동되었습니다.");

    // 두 번째 주소가 확인할 수 있는 자녀 목록을 출력
    const secondaryAddressChildren = await parentChildRelationship
      .connect(secondaryAddress)
      .returnChildInformation();
    console.log("두 번째 주소가 확인할 수 있는 자녀 정보:");
    console.log(secondaryAddressChildren);
  });
});
