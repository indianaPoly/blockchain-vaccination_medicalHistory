// import CryptoJS from "crypto-js";
//
// describe("암호화", () => {
//   it("test1", async () => {
//     const dataToEncrypt = "캡스톤 화이팅!"; // 암호화할 메시지
//     const customMessage = "soongsil"; // 우리만의 비밀 암호
//     const metaMaskAddress = "0x1234567890abcdef1234567890abcdef12345678";
//
//     // 2. 솔트 생성 (128비트 솔트)
//     const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
//
//     // 3. MetaMask 주소와 메시지, 솔트를 결합하여 암호화 키 생성 (PBKDF2 사용)
//     const combinedString = metaMaskAddress + customMessage;
//     const encryptionKey = CryptoJS.PBKDF2(combinedString, salt, {
//       keySize: 256 / 32,
//       iterations: 1000,
//     }).toString();
//
//     console.log("입력하고자 하는 데이터 : ", dataToEncrypt);
//     console.log("");
//     console.log("우리들만의 암호 : ", customMessage);
//     console.log("");
//     console.log("사용자 메타마스크 주소 : ", metaMaskAddress);
//     console.log("");
//     console.log("우리들만의 암허와 메타마스크 주소 결합 값 : ", combinedString);
//     console.log("");
//     console.log("salt 값 : ", salt);
//     console.log("");
//     console.log("secret key : ", encryptionKey);
//     console.log("");
//     // 4. AES 암호화 수행
//     const encryptedData = CryptoJS.AES.encrypt(
//       dataToEncrypt,
//       encryptionKey
//     ).toString();
//
//     // 5. 암호화된 데이터와 솔트를 함께 저장하는 형식 (여기서는 솔트를 앞에 붙임)
//     const encryptedDataWithSalt = salt + encryptedData;
//
//     console.log("실제로 저장이 되는 값 : ", encryptedDataWithSalt);
//     console.log("");
//
//     // 복호화 예시
//     // 6. 복호화할 때, 먼저 솔트를 분리
//     const saltFromData = encryptedDataWithSalt.substring(0, 32); // 32자는 128비트 솔트
//     const encryptedDataWithoutSalt = encryptedDataWithSalt.substring(32); // 나머지는 암호화된 데이터
//
//     // 7. 분리한 솔트를 이용해 키 복원
//     const derivedKeyForDecryption = CryptoJS.PBKDF2(
//       combinedString,
//       saltFromData,
//       {
//         keySize: 256 / 32,
//         iterations: 1000,
//       }
//     ).toString();
//
//     // 8. AES 복호화 수행
//     const bytes = CryptoJS.AES.decrypt(
//       encryptedDataWithoutSalt,
//       derivedKeyForDecryption
//     );
//     const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
//
//     console.log("복호화 결과 : ", decryptedData); // 원래의 데이터 'Here is some sensitive data' 출력
//     console.log("");
//   });
// });
