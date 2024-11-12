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
        .returnHealthInformation(childAddress);
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
        .returnHealthInformation(childAddress);
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

  describe("진료 기록 메타트랜잭션 테스트", () => {
    let parentChildRelationship,
      healthInformation,
      medicalHistory,
      vaccinationManagement;
    let owner, parent;

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

    // 자녀 생성 헬퍼 함수
    async function createChild(
      parentSigner,
      childName,
      birthDate,
      height,
      weight
    ) {
      const domain = await getDomainData(parentSigner);
      const nonce = await parentChildRelationship.getNonce(
        parentSigner.address
      );

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

      const signature = await parentSigner.signTypedData(
        domain,
        types,
        message
      );
      const { v, r, s } = ethers.Signature.from(signature);

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
      [owner, parent] = await ethers.getSigners();

      // 컨트랙트 배포
      const HealthInformation = await ethers.getContractFactory(
        "HealthInformation"
      );
      healthInformation = await HealthInformation.deploy();
      await healthInformation.waitForDeployment();

      const MedicalHistory = await ethers.getContractFactory("MedicalHistory");
      medicalHistory = await MedicalHistory.deploy();
      await medicalHistory.waitForDeployment();

      const VaccinationManagement = await ethers.getContractFactory(
        "VaccinationManagement"
      );
      vaccinationManagement = await VaccinationManagement.deploy();
      await vaccinationManagement.waitForDeployment();

      const ParentChildRelationship = await ethers.getContractFactory(
        "ParentChildRelationshipWithMeta"
      );
      parentChildRelationship = await ParentChildRelationship.deploy(
        await healthInformation.getAddress(),
        await medicalHistory.getAddress(),
        await vaccinationManagement.getAddress()
      );
      await parentChildRelationship.waitForDeployment();
    });

    describe("진료 기록 추가 테스트", () => {
      it("메타트랜잭션으로 진료 기록을 추가할 수 있다", async () => {
        // 1. 먼저 자녀 생성
        const childName = "고현림";
        const birthDate = Math.floor(new Date("2024-01-01").getTime() / 1000);
        const height = 120.1 * 10;
        const weight = 50.3 * 10;

        const childAddress = await createChild(
          parent,
          childName,
          birthDate,
          height,
          weight
        );
        console.log("생성된 자녀 주소:", childAddress);

        // 2. 진료 기록 추가를 위한 메타트랜잭션 준비
        const domain = await getDomainData(parent);
        const nonce = await parentChildRelationship.getNonce(parent.address);

        const types = {
          AddMedicalHistory: [
            { name: "parent", type: "address" },
            { name: "childAddress", type: "address" },
            { name: "medicalType", type: "uint8" },
            { name: "visitedName", type: "string" },
            { name: "timestamp", type: "string" },
            { name: "doctorName", type: "string" },
            { name: "symptoms", type: "string" },
            { name: "diagnosisDetails", type: "string" },
            { name: "nonce", type: "uint256" },
          ],
        };

        const medicalData = {
          parent: parent.address,
          childAddress: childAddress,
          medicalType: 0, // 일반 진료
          visitedName: "서울대학교병원",
          timestamp: "2024-01-15 09:30",
          doctorName: "김의사",
          symptoms: "발열, 기침",
          diagnosisDetails: "감기 증상으로 해열제와 기침약 처방",
          nonce: nonce,
        };

        const signature = await parent.signTypedData(
          domain,
          types,
          medicalData
        );
        const { v, r, s } = ethers.Signature.from(signature);

        // 3. 메타트랜잭션 실행
        await parentChildRelationship.executeMetaAddMedicalHistory(
          parent.address,
          childAddress,
          medicalData.medicalType,
          medicalData.visitedName,
          medicalData.timestamp,
          medicalData.doctorName,
          medicalData.symptoms,
          medicalData.diagnosisDetails,
          v,
          r,
          s
        );

        // 4. 진료 기록 조회 및 확인
        const medicalHistories = await parentChildRelationship
          .connect(parent)
          .returnMedicalHistoriesForChild(childAddress);

        console.log("\n=== 추가된 진료 기록 ===");
        console.log(medicalHistories);
      });
    });
  });

  describe("백신업데이트", () => {
    it("백신 업데이트", async () => {
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
      console.log("4. 생성된 자녀 주소:", childAddress);

      // 백신에 대한 정보
      const initVaxStatus = await parentChildRelationship
        .connect(parent)
        .returnChildVaccinationStatus(childAddress);

      console.log("초기 백신 정보");
      console.log(initVaxStatus);

      const vaccineName = "DTap"; // 변수명 수정
      const vaccineChapter = 1; // 변수명 수정
      const administeredDate = toUnixTimestamp("20241010"); // 변수명 수정

      const domain = await getDomainData(parent);
      const nonce = await parentChildRelationship.getNonce(parent.address);

      const types = {
        UpdateVaccination: [
          { name: "parent", type: "address" },
          { name: "childAddress", type: "address" },
          { name: "vaccineName", type: "string" },
          { name: "vaccineChapter", type: "uint8" },
          { name: "administeredDate", type: "uint256" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const message = {
        parent: parent.address,
        childAddress,
        vaccineName, // 속성명 수정
        vaccineChapter, // 속성명 수정
        administeredDate, // 속성명 수정
        nonce,
      };

      const signature = await parent.signTypedData(domain, types, message);
      const { v, r, s } = hre.ethers.Signature.from(signature);

      // 메타트랜잭션 실행
      await parentChildRelationship.executeMetaUpdateVaccination(
        parent.address,
        childAddress,
        vaccineName, // 변수명 수정
        vaccineChapter, // 변수명 수정
        administeredDate, // 변수명 수정
        v,
        r,
        s
      );

      const updatedVaxStatus = await parentChildRelationship
        .connect(parent)
        .returnChildVaccinationStatus(childAddress);
      console.log("\n=== 백신 접종 업데이트 결과 ===");
      console.log(updatedVaxStatus);
    });
  });

  describe("다중 백신 업데이트", () => {
    it("여러 백신 동시 업데이트", async () => {
      // 자녀 생성
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
      console.log("생성된 자녀 주소:", childAddress);

      // 초기 백신 상태 조회
      const initVaxStatus = await parentChildRelationship
        .connect(parent)
        .returnChildVaccinationStatus(childAddress);

      console.log("초기 백신 정보:");
      console.log(initVaxStatus);

      // 여러 백신 업데이트 준비
      const vaccinations = [
        {
          vaccineName: "DTap",
          vaccineChapter: 2, // 2차 입력하면 1차도 자동으로 완료
          administerDate: toUnixTimestamp("20241010"),
        },
        {
          vaccineName: "IPV",
          vaccineChapter: 1,
          administerDate: toUnixTimestamp("20241010"),
        },
      ];

      const domain = await getDomainData(parent);
      const nonce = await parentChildRelationship.getNonce(parent.address);

      const types = {
        UpdateMultipleVaccination: [
          { name: "parent", type: "address" },
          { name: "childAddress", type: "address" },
          { name: "vaccinations", type: "VaccinationInput[]" },
          { name: "nonce", type: "uint256" },
        ],
        VaccinationInput: [
          { name: "vaccineName", type: "string" },
          { name: "vaccineChapter", type: "uint8" },
          { name: "administerDate", type: "uint256" },
        ],
      };

      const message = {
        parent: parent.address,
        childAddress,
        vaccinations,
        nonce,
      };

      const signature = await parent.signTypedData(domain, types, message);
      const { v, r, s } = hre.ethers.Signature.from(signature);

      // 메타트랜잭션 실행
      await parentChildRelationship.executeMetaUpdateMultipleVaccination(
        parent.address,
        childAddress,
        vaccinations,
        v,
        r,
        s
      );

      // 업데이트된 상태 확인
      const updatedVaxStatus = await parentChildRelationship
        .connect(parent)
        .returnChildVaccinationStatus(childAddress);

      console.log("\n=== 백신 접종 업데이트 결과 ===");
      console.log(updatedVaxStatus);
    });
  });
});
