import hre from "hardhat";

describe("부모-자녀 관계 컨트랙트 테스트", () => {
  let ParentChildRelationship, parentChildRelationship;
  let HealthInformation, healthInformation;
  let MedicalHistory, medicalHistory;
  let VaccinationManagement, vaccinationManagement;

  let parent1, parent2;
  let firstChildAddress, secondChildAddress;

  beforeEach(async () => {
    [parent1, parent2] = await hre.ethers.getSigners();

    // 자녀 건강정보 컨트랙트 배포
    HealthInformation = await hre.ethers.getContractFactory(
      "HealthInformation"
    );
    healthInformation = await HealthInformation.deploy();

    // 진료 내역 컨트랙트 배포
    MedicalHistory = await hre.ethers.getContractFactory("MedicalHistory");
    medicalHistory = await MedicalHistory.deploy();

    // 예방 접종 관리 컨트랙트 배포
    VaccinationManagement = await hre.ethers.getContractFactory(
      "VaccinationManagement"
    );
    vaccinationManagement = await VaccinationManagement.deploy();

    // 부모-자녀 관계 컨트랙트 배포
    ParentChildRelationship = await hre.ethers.getContractFactory(
      "ParentChildRelationship"
    );
    parentChildRelationship = await ParentChildRelationship.deploy(
      await healthInformation.getAddress(),
      await medicalHistory.getAddress(),
      await vaccinationManagement.getAddress()
    );
  });

  it("메인 컨트랙트 테스트", async () => {
    await parentChildRelationship
      .connect(parent1)
      .createChild("고현림", 20231030, 10.1 * 10, 90.1 * 10);
    await parentChildRelationship
      .connect(parent1)
      .createChild("고희림", 20241010, 10.1 * 10, 90.1 * 10);

    const parent1Children =
      await parentChildRelationship.returnChildInformation();
    console.log("부모 1이 확인할 수 있는 자녀 정보:", parent1Children);

    firstChildAddress = await parentChildRelationship
      .connect(parent1)
      .returnChildAddress("고현림");

    await parentChildRelationship
      .connect(parent2)
      .connectChild(firstChildAddress);
    const parent2Children = await parentChildRelationship
      .connect(parent2)
      .returnChildInformation();
    console.log("부모 2와 연동된 자녀 정보:", parent2Children);
  });

  it("건강정보 컨트랙트 테스트", async () => {
    await parentChildRelationship
      .connect(parent1)
      .createChild("고현림", 20231030, 10.1 * 10, 90.1 * 10);
    await parentChildRelationship
      .connect(parent1)
      .createChild("고희림", 20241010, 10.1 * 10, 90.1 * 10);

    firstChildAddress = await parentChildRelationship
      .connect(parent1)
      .returnChildAddress("고현림");
    secondChildAddress = await parentChildRelationship
      .connect(parent1)
      .returnChildAddress("고희림");

    let childHealthData = await parentChildRelationship
      .connect(parent1)
      .getHealthInformation(firstChildAddress);
    console.log("자녀 1의 초기 건강 정보:", childHealthData);

    await parentChildRelationship
      .connect(parent1)
      .setHealthInformation(firstChildAddress, 175.5 * 10, 80.7 * 10);

    childHealthData = await parentChildRelationship
      .connect(parent1)
      .getHealthInformation(firstChildAddress);
    console.log("수정 후 자녀 1의 건강 정보 (부모 1로부터):", childHealthData);

    childHealthData = await parentChildRelationship
      .connect(parent2)
      .getHealthInformation(firstChildAddress);
    console.log("수정 후 자녀 1의 건강 정보 (부모 2로부터):", childHealthData);
  });

  it("진료 내역 컨트랙트 테스트", async () => {
    await parentChildRelationship
      .connect(parent1)
      .createChild("고현림", 20231030, 10.1 * 10, 90.1 * 10);
    firstChildAddress = await parentChildRelationship
      .connect(parent1)
      .returnChildAddress("고현림");

    await parentChildRelationship
      .connect(parent1)
      .addMedicalHistoryForChild(
        firstChildAddress,
        0,
        "세브란스 병원",
        "2024.10.10",
        "감기",
        "환절기 감기",
        "환절기에 따른 감기"
      );

    let childMedicalHistory = await parentChildRelationship
      .connect(parent1)
      .getMedicalHistoriesForChild(firstChildAddress);
    console.log("자녀 1의 진료 내역 (부모 1로부터):", childMedicalHistory);

    await parentChildRelationship
      .connect(parent2)
      .addMedicalHistoryForChild(
        firstChildAddress,
        0,
        "차병원",
        "2024.11.10",
        "독감",
        "인플루엔자",
        "독감 유행"
      );

    childMedicalHistory = await parentChildRelationship
      .connect(parent2)
      .getMedicalHistoriesForChild(firstChildAddress);
    console.log("자녀 1의 진료 내역 (부모 2로부터):", childMedicalHistory);
  });

  it("예방 접종 컨트랙트 테스트", async () => {
    // 초기 예방 접종 mapping 상태 저장
    await vaccinationManagement
      .connect(parent1)
      .initializeVaccinationRecords(firstChildAddress);
    console.log("자녀1에 대한 초기 백신 상테를 형성하였습니다.\n");

    let firstChildVax = await vaccinationManagement
      .connect(parent1)
      .returnChildVaccinationStatus(firstChildAddress);
    console.log("자녀1에 대한 백신 접종 상태");
    console.log(firstChildVax);

    await vaccinationManagement
      .connect(parent1)
      .updateChildVaccination(firstChildAddress, "BCG");

    console.log("자녀가 백신을 맞았습니다.");
    console.log("백신을 맞고난 이후에 정보");
    firstChildVax = await vaccinationManagement
      .connect(parent1)
      .returnChildVaccinationStatus(firstChildAddress);
    console.log(firstChildVax);
  });
});
