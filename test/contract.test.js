import hre from "hardhat";

describe("Contract Test - Parent-Child Relationship", () => {
  let ParentChildRelationship, parentChildRelationship;
  let HealthInformation, healthInformation;
  let MedicalHistory, medicalHistory;
  let VaccinationManagement, vaccinationManagement;

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

    // 진료 내역 컨트랙트 배포
    console.log("진료 내역 컨트랙트를 배포합니다...");
    MedicalHistory = await hre.ethers.getContractFactory("MedicalHistory");
    medicalHistory = await MedicalHistory.deploy();
    console.log("진료 내역 컨트랙트가 정상적으로 배포되었습니다.");
    console.log(
      "진료 내역 컨트랙트 주소: ",
      await medicalHistory.getAddress(),
      "\n"
    );

    // 예방 접종 관리 컨트랙트 배포
    console.log("예방 접종 컨트랙트를 배포합니다...");
    VaccinationManagement = await hre.ethers.getContractFactory(
      "VaccinationManagement"
    );
    vaccinationManagement = await VaccinationManagement.deploy();
    console.log("예뱡 접종 컨트랙트가 정상적으로 배포되었습니다.");
    console.log(
      "예뱡 접종 컨트랙트 주소: ",
      await vaccinationManagement.getAddress(),
      "\n"
    );

    // 부모-자녀 관계 컨트랙트를 배포
    console.log("부모-자녀 관계 컨트랙트를 배포합니다...");
    ParentChildRelationship = await hre.ethers.getContractFactory(
      "ParentChildRelationship"
    );
    parentChildRelationship = await ParentChildRelationship.deploy(
      await healthInformation.getAddress(),
      await medicalHistory.getAddress(),
      await vaccinationManagement.getAddress()
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
    await parentChildRelationship
      .connect(owner)
      .createChild("Go Hyunlim", 20231030, 10.1 * 10, 90.1 * 10);
    await parentChildRelationship
      .connect(owner)
      .createChild("Go Hwirim", 20241010, 10.1 * 10, 90.1 * 10);
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

    const secondChildAddress = await parentChildRelationship
      .connect(owner)
      .returnChildAddress("Go Hwirim");

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

    // 부모 1로 부터 자녀의 건강정보에 대한 정보 가져오기
    let child1_healthData_parent1 = await parentChildRelationship
      .connect(owner)
      .getHealthInformation(firstChildAddress);
    const child2_healthData_parent1 = await parentChildRelationship
      .connect(owner)
      .getHealthInformation(secondChildAddress);

    console.log("");
    console.log("부모 1로부터 조회할 수 있는 아이의 건강정보");
    console.log("자녀 1 : ", child1_healthData_parent1);
    console.log("자녀 2 : ", child2_healthData_parent1, "\n");

    let child1_healthData_parent2 = await parentChildRelationship
      .connect(secondaryAddress)
      .getHealthInformation(firstChildAddress);
    console.log("부모 2로부터 확인할 수 있는 자녀의 정보");
    console.log("자녀 1 : ", child1_healthData_parent2, "\n");

    console.log("자녀의 정보를 변경 후 동일한 정보를 확인할 수 있는지 확인");
    console.log("자녀1의 키와 몸무게를 변경 진행");
    await parentChildRelationship
      .connect(owner)
      .setHealthInformation(firstChildAddress, 175.5 * 10, 80.7 * 10);
    console.log("자녀1의 키와 몸무게 수정을 하였습니다.", "\n");

    console.log("수정한 이후의 데이터를 부모1, 부모 2 둘 다 조회");
    child1_healthData_parent1 = await parentChildRelationship
      .connect(owner)
      .getHealthInformation(firstChildAddress);
    child1_healthData_parent2 = await parentChildRelationship
      .connect(secondaryAddress)
      .getHealthInformation(firstChildAddress);
    console.log("부모 1로 부터 수정된 자녀의 정보를 확인");
    console.log("자녀 1 : ", child1_healthData_parent1, "\n");
    console.log("부모 2로 부터 수정된 자녀의 정보를 확인");
    console.log("자녀 1 : ", child1_healthData_parent2, "\n");

    console.log("진료 내역을 추가하는 테스트 입니다.");
    await parentChildRelationship
      .connect(owner)
      .addMedicalHistoryForChild(
        firstChildAddress,
        0,
        "세브란스 병원",
        "2024.10.10",
        "갑을병",
        "감기",
        "환절기에 따른 감기"
      );
    console.log("부모 1이 자녀 1의 진료 내역을 추가하였습니다.\n");

    console.log("부모 1이 자녀 1에 대한 진료 내역 조회");
    let child1_medicalHistory_parent1 = await parentChildRelationship
      .connect(owner)
      .getMedicalHistoriesForChild(firstChildAddress);
    console.log(child1_medicalHistory_parent1, "\n");

    console.log("부모 2가 자녀 1에 대한 진료 내역 조회");
    let child1_medicalHistory_parent2 = await parentChildRelationship
      .connect(secondaryAddress)
      .getMedicalHistoriesForChild(firstChildAddress);
    console.log(child1_medicalHistory_parent2);

    await parentChildRelationship
      .connect(secondaryAddress)
      .addMedicalHistoryForChild(
        firstChildAddress,
        0,
        "차병원",
        "2024.11.10",
        "숭실",
        "독감",
        "독감 유행"
      );
    console.log("부모 2가 자녀 1의 진료 내역을 추가하였습니다.\n");

    console.log("부모 1이 자녀 1에 대한 진료 내역 조회");
    child1_medicalHistory_parent1 = await parentChildRelationship
      .connect(owner)
      .getMedicalHistoriesForChild(firstChildAddress);
    console.log(child1_medicalHistory_parent1, "\n");

    console.log("부모 2가 자녀 1에 대한 진료 내역 조회");
    child1_medicalHistory_parent2 = await parentChildRelationship
      .connect(secondaryAddress)
      .getMedicalHistoriesForChild(firstChildAddress);
    console.log(child1_medicalHistory_parent2);
  });
});
