require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

dotenv.config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.27",
    settings: {
      viaIR: true,
    },
  },
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
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};
