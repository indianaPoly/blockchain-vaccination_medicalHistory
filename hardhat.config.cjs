require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {
      // Hardhat 네트워크 설정
      accounts: {
        count: 1500, // 테스트에 필요한 계정 수 (numberOfParents보다 많아야 함)
        accountsBalance: "10000000000000000000000", // 각 계정의 초기 잔액 (wei 단위)
      },
    },
  },
};
