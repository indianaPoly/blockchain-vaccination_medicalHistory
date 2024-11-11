describe("메타 트랜젝션 테스트 진행", () => {
  let parentChildRelationship,
    healthInformation,
    medicalHistory,
    vaccinationManagement;
  let owner, parent, newParent;

  // 유틸리티 함수들
  function toUnixTimestamp(dateStr) {
    const date = new Date(
      `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
    );
    return Math.floor(date.getTime() / 1000);
  }

  // 도메인 데이터 생성 함수
  async function getDomainData(signer) {
    return {
      name: "ParentChildRelationshipWithMeta",
      version: "1",
      chainId: await signer.provider
        .getNetwork()
        .then((network) => network.chainId),
      verifyingContract: parentChildRelationship.target,
    };
  }

  // 자녀 생성 함수
  async function createChild(
    parentSigner,
    childName,
    birthDate,
    height,
    weight
  ) {
    const domain = await getDomainData(parentSigner);
    const nonce = await parentChildRelationship.getNonce(parentSigner.address);

    const types = {
      CreateChild: [
        { name: "parent", type: "address" },
        { name: "name", type: "string" },
        { name: "birthDate", type: "uint256" },
        { name: "height", type: "uint16" },
        { name: "weight", type: "uint16" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const message = {
      parent: parentSigner.address,
      name: childName,
      birthDate,
      height,
      weight,
      nonce,
    };

    const signature = await parentSigner.signTypedData(domain, types, message);
    const { v, r, s } = hre.ethers.Signature.from(signature);

    await parentChildRelationship.executeMetaCreateChild(
      parentSigner.address,
      childName,
      birthDate,
      height,
      weight,
      v,
      r,
      s
    );

    const childInfo = await parentChildRelationship
      .connect(parentSigner)
      .returnChildInformation();
    return childInfo[0].childAddress;
  }

  beforeEach(async () => {
    [owner, parent, newParent] = await hre.ethers.getSigners();

    const HealthInformation = await hre.ethers.getContractFactory(
      "HealthInformation"
    );
    healthInformation = await HealthInformation.deploy();
    await healthInformation.waitForDeployment();

    const MedicalHistory = await hre.ethers.getContractFactory(
      "MedicalHistory"
    );
    medicalHistory = await MedicalHistory.deploy();
    await medicalHistory.waitForDeployment();

    const VaccinationManagement = await hre.ethers.getContractFactory(
      "VaccinationManagement"
    );
    vaccinationManagement = await VaccinationManagement.deploy();
    await vaccinationManagement.waitForDeployment();

    const ParentChildRelationship = await hre.ethers.getContractFactory(
      "ParentChildRelationshipWithMeta"
    );
    parentChildRelationship = await ParentChildRelationship.deploy(
      await healthInformation.getAddress(),
      await medicalHistory.getAddress(),
      await vaccinationManagement.getAddress()
    );
    await parentChildRelationship.waitForDeployment();
  });

  describe("CreateChild test", () => {
    it("자녀 생성", async () => {
      const name = "고현림";
      const birthDate = toUnixTimestamp("20241101");
      const height = 120.1 * 10;
      const weight = 50.3 * 10;

      await createChild(parent, name, birthDate, height, weight);

      const childInfo = await parentChildRelationship
        .connect(parent)
        .returnChildInformation();
      console.log(
        `1. CreateChild 테스트 - ${parent.address} 자녀 정보:`,
        childInfo
      );
    });
  });

  describe("ConnectChild test", () => {
    it("새로운 부모와 연결", async () => {
      // 1. 먼저 첫 번째 부모가 자녀를 생성
      const name = "고현림";
      const birthDate = toUnixTimestamp("20241101");
      const height = 120.1 * 10;
      const weight = 50.3 * 10;

      const childAddress = await createChild(
        parent,
        name,
        birthDate,
        height,
        weight
      );
      console.log("2. ConnectChild 테스트 - 생성된 자녀 주소:", childAddress);

      // 2. 새로운 부모와 자녀 연결
      const connectChildDomain = await getDomainData(newParent);
      const connectChildNonce = await parentChildRelationship.getNonce(
        newParent.address
      );

      const connectChildTypes = {
        ConnectChild: [
          { name: "parent", type: "address" },
          { name: "childAddress", type: "address" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const connectChildMessage = {
        parent: newParent.address,
        childAddress,
        nonce: connectChildNonce,
      };

      const connectChildSignature = await newParent.signTypedData(
        connectChildDomain,
        connectChildTypes,
        connectChildMessage
      );
      const { v, r, s } = hre.ethers.Signature.from(connectChildSignature);

      await parentChildRelationship.executeMetaConnectChild(
        newParent.address,
        childAddress,
        v,
        r,
        s
      );

      const newParentChildInfo = await parentChildRelationship
        .connect(newParent)
        .returnChildInformation();
      console.log(
        `2. ConnectChild 테스트 - ${newParent.address}의 자녀 정보:`,
        newParentChildInfo
      );
    });
  });

  // 나머지 테스트 코드는 그대로 유지...
  describe("자녀 건강 정보 조회 및 확인", () => {
    it("자녀 건강 정보 조회 및 확인", async () => {
      // 자녀 생성 부분을 createChild 함수 사용하도록 수정
      const name = "고현림";
      const birthDate = toUnixTimestamp("20241101");
      const height = 120.1 * 10;
      const weight = 50.3 * 10;

      const childAddress = await createChild(
        parent,
        name,
        birthDate,
        height,
        weight
      );
      console.log("3. 생성된 자녀 주소:", childAddress);

      // 초기 건강 정보 조회
      const initialHealthInfo = await parentChildRelationship
        .connect(parent)
        .getHealthInformation(childAddress);
      console.log("3. 초기 자녀 건강 정보:", initialHealthInfo);

      // 건강 정보 수정
      const newHeight = 125.5 * 10;
      const newWeight = 52.8 * 10;

      const setHealthInfoDomain = await getDomainData(parent);
      const setHealthInfoNonce = await parentChildRelationship.getNonce(
        parent.address
      );

      const setHealthInfoTypes = {
        SetHealthInfo: [
          { name: "parent", type: "address" },
          { name: "childAddress", type: "address" },
          { name: "height", type: "uint16" },
          { name: "weight", type: "uint16" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const setHealthInfoMessage = {
        parent: parent.address,
        childAddress,
        height: newHeight,
        weight: newWeight,
        nonce: setHealthInfoNonce,
      };

      const setHealthInfoSignature = await parent.signTypedData(
        setHealthInfoDomain,
        setHealthInfoTypes,
        setHealthInfoMessage
      );
      const { v, r, s } = hre.ethers.Signature.from(setHealthInfoSignature);

      await parentChildRelationship.executeMetaSetHealthInformation(
        parent.address,
        childAddress,
        newHeight,
        newWeight,
        v,
        r,
        s
      );

      const updatedHealthInfo = await parentChildRelationship
        .connect(parent)
        .getHealthInformation(childAddress);
      console.log("3. 수정된 자녀 건강 정보:", updatedHealthInfo);

      console.log("\n=== 건강 정보 변경 상세 ===");
      console.log("초기 키:", Number(initialHealthInfo.height) / 10, "cm");
      console.log("수정된 키:", Number(updatedHealthInfo.height) / 10, "cm");
      console.log("초기 몸무게:", Number(initialHealthInfo.weight) / 10, "kg");
      console.log(
        "수정된 몸무게:",
        Number(updatedHealthInfo.weight) / 10,
        "kg"
      );
    });
  });
});
