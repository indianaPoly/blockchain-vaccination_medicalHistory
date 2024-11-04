// import hre from "hardhat";
//
// describe("대규모 부모-자녀 관계 컨트랙트 안정성 테스트", () => {
//   let ParentChildRelationship, parentChildRelationship;
//   let HealthInformation, healthInformation;
//   let MedicalHistory, medicalHistory;
//   let VaccinationManagement, vaccinationManagement;
//
//   let parentSigners = [];
//   const numberOfParents = 1000;
//   const childrenPerParent = 2;
//   const BATCH_SIZE = 50; // 한 번에 처리할 부모의 수
//
//   before(async () => {
//     parentSigners = await hre.ethers.getSigners();
//
//     [
//       HealthInformation,
//       MedicalHistory,
//       VaccinationManagement,
//       ParentChildRelationship,
//     ] = await Promise.all([
//       hre.ethers.getContractFactory("HealthInformation"),
//       hre.ethers.getContractFactory("MedicalHistory"),
//       hre.ethers.getContractFactory("VaccinationManagement"),
//       hre.ethers.getContractFactory("ParentChildRelationship"),
//     ]);
//
//     // 컨트랙트 배포를 병렬로 처리
//     [healthInformation, medicalHistory, vaccinationManagement] =
//       await Promise.all([
//         HealthInformation.deploy(),
//         MedicalHistory.deploy(),
//         VaccinationManagement.deploy(),
//       ]);
//
//     await Promise.all([
//       healthInformation.waitForDeployment(),
//       medicalHistory.waitForDeployment(),
//       vaccinationManagement.waitForDeployment(),
//     ]);
//
//     parentChildRelationship = await ParentChildRelationship.deploy(
//       await healthInformation.getAddress(),
//       await medicalHistory.getAddress(),
//       await vaccinationManagement.getAddress()
//     );
//     await parentChildRelationship.waitForDeployment();
//   });
//
//   // 배치 처리를 위한 헬퍼 함수
//   async function processBatch(startIdx, endIdx, totalGasUsed = BigInt(0)) {
//     const batchPromises = [];
//
//     for (let i = startIdx; i < endIdx; i++) {
//       const parent = parentSigners[i];
//       if (!parent) continue;
//
//       const childPromises = Array.from(
//         { length: childrenPerParent },
//         async (_, j) => {
//           const childName = `Child_${i + 1}_${j + 1}`;
//           const birthDate = BigInt(20230000 + i + j);
//           const height = BigInt(Math.floor(500 + i * 5 + j * 2));
//           const weight = BigInt(Math.floor(30 + i * 2 + j * 1));
//
//           const tx = await parentChildRelationship
//             .connect(parent)
//             .createChild(childName, birthDate, height, weight);
//           const receipt = await tx.wait();
//           return receipt.gasUsed;
//         }
//       );
//
//       batchPromises.push(...childPromises);
//     }
//
//     const gasResults = await Promise.all(batchPromises);
//     const batchGasUsed = gasResults.reduce(
//       (acc, gas) => acc + BigInt(gas),
//       BigInt(0)
//     );
//     return totalGasUsed + batchGasUsed;
//   }
//
//   // 데이터 검증을 위한 헬퍼 함수
//   async function validateBatch(startIdx, endIdx) {
//     const validationPromises = [];
//
//     for (let i = startIdx; i < endIdx; i++) {
//       const parent = parentSigners[i];
//       if (!parent) continue;
//
//       const promise = async () => {
//         const children = await parentChildRelationship
//           .connect(parent)
//           .returnChildInformation();
//         return { parentIndex: i, children };
//       };
//
//       validationPromises.push(promise());
//     }
//
//     return Promise.all(validationPromises);
//   }
//
//   it("대규모 부모-자녀 추가 및 안정성 테스트 보고서", async () => {
//     let totalGasUsed = BigInt(0);
//     const startTime = Date.now();
//
//     console.log("1. 대규모 부모와 자녀 추가 테스트를 시작합니다.");
//
//     // 배치 단위로 처리
//     for (let i = 0; i < numberOfParents; i += BATCH_SIZE) {
//       const endIdx = Math.min(i + BATCH_SIZE, numberOfParents);
//       console.log(`배치 처리 중: ${i + 1} ~ ${endIdx} 번째 부모`);
//
//       totalGasUsed = await processBatch(i, endIdx, totalGasUsed);
//
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 간격 추가
//
//       // 각 배치의 데이터 검증
//       const batchValidationResults = await validateBatch(i, endIdx);
//       console.log(
//         `배치 ${i / BATCH_SIZE + 1} 검증 완료: ${
//           batchValidationResults.length
//         } 건`
//       );
//     }
//
//     const endTime = Date.now();
//     const totalTimeInSeconds = (endTime - startTime) / 1000;
//     const averageGasPerChild =
//       totalGasUsed / BigInt(numberOfParents * childrenPerParent);
//
//     console.log("\n테스트 결과 보고서:");
//     console.log(`- 총 부모 수: ${numberOfParents}`);
//     console.log(`- 배치 크기: ${BATCH_SIZE}`);
//     console.log(`- 총 배치 수: ${Math.ceil(numberOfParents / BATCH_SIZE)}`);
//     console.log(`- 부모당 자녀 수: ${childrenPerParent}`);
//     console.log(`- 총 가스 사용량: ${totalGasUsed.toString()}`);
//     console.log(`- 자녀당 평균 가스 사용량: ${averageGasPerChild.toString()}`);
//     console.log(`- 총 소요 시간: ${totalTimeInSeconds}초`);
//     console.log(
//       `- 초당 처리된 트랜잭션: ${(
//         (numberOfParents * childrenPerParent) /
//         totalTimeInSeconds
//       ).toFixed(2)}`
//     );
//     console.log(
//       `- 시간 제한 충족 여부: ${totalTimeInSeconds <= 300 ? "성공" : "실패"}`
//     );
//
//     // 성능 메트릭스 계산
//     const throughput =
//       (numberOfParents * childrenPerParent) / totalTimeInSeconds;
//     const avgLatency =
//       (totalTimeInSeconds / (numberOfParents * childrenPerParent)) * 1000; // ms
//
//     console.log("\n성능 메트릭스:");
//     console.log(`- 처리량(TPS): ${throughput.toFixed(2)}`);
//     console.log(`- 평균 레이턴시: ${avgLatency.toFixed(2)}ms`);
//     console.log(
//       `- 배치당 평균 처리 시간: ${(
//         totalTimeInSeconds / Math.ceil(numberOfParents / BATCH_SIZE)
//       ).toFixed(2)}초`
//     );
//   });
// });
