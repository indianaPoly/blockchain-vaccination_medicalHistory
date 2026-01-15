import hre from "hardhat";
import { ethersService } from "../utils/ethersService.js";

const CONTRACT_NAME = "parentChildRelationship";

const parseSignature = (signature) =>
  hre.ethers.Signature.from(signature);

const buildTransactionPayload = (contract, receipt) => {
  const contractAddress = contract.target?.toLowerCase();
  const events = receipt.logs
    .filter((log) => log.address?.toLowerCase() === contractAddress)
    .map((log) => contract.interface.parseLog(log));

  return {
    transactionHash: receipt.hash,
    events,
  };
};

const handleError = (res, message, error) => {
  console.error(message, error);
  res.status(500).json({
    success: false,
    error: error.message,
  });
};

export class ChildController {
  async test(req, res) {
    res.json({
      success: true,
      data: {
        value: "hi",
      },
    });
  }

  /*
  {
    "parent": "0x..." (string),
    "childName": "고현림" (string),
    "birthDate": "20241212" (string),
    "height": 120.1 (number),
    "weight": 20.1 (number)
  }
  */
  async createChild(req, res) {
    try {
      const { parent, childName, birthDate, height, weight, signature } =
        req.body;

      const contract = ethersService.getContract(CONTRACT_NAME);
      const { v, r, s } = parseSignature(signature);

      const tx = await contract.executeMetaCreateChild(
        parent,
        childName,
        birthDate,
        height,
        weight,
        v,
        r,
        s
      );

      const receipt = await tx.wait();
      res.json({
        success: true,
        data: buildTransactionPayload(contract, receipt),
      });
    } catch (error) {
      handleError(res, "Error creating child:", error);
    }
  }

  async updateHealthInfo(req, res) {
    try {
      const { parent, childAddress, height, weight } = req.body;
      const contract = ethersService.getContract(CONTRACT_NAME);

      const nonce = await contract.getNonce(parent);
      const chainId = (await ethersService.getProvider().getNetwork()).chainId;

      const domain = {
        name: "ParentChildRelationshipWithMeta",
        version: "1",
        chainId,
        verifyingContract: contract.target,
      };

      const types = {
        SetHealthInfo: [
          { name: "parent", type: "address" },
          { name: "childAddress", type: "address" },
          { name: "height", type: "uint16" },
          { name: "weight", type: "uint16" },
          { name: "nonce", type: "uint256" },
        ],
      };

      const value = {
        parent,
        childAddress,
        height: height * 10,
        weight: weight * 10,
        nonce,
      };

      const wallet = ethersService.getWallet();
      const signature = await wallet.signTypedData(domain, types, value);
      const { v, r, s } = parseSignature(signature);

      const tx = await contract.executeMetaSetHealthInformation(
        parent,
        childAddress,
        height,
        weight,
        v,
        r,
        s
      );

      const receipt = await tx.wait();
      res.json({
        success: true,
        data: buildTransactionPayload(contract, receipt),
      });
    } catch (error) {
      handleError(res, "Error updating health info:", error);
    }
  }

  async addMedicalHistory(req, res) {
    try {
      const {
        parent,
        childAddress,
        medicalType,
        visitedName,
        timestamp,
        doctorName,
        symptoms,
        diagnosisDetails,
        signature,
      } = req.body;

      const contract = ethersService.getContract(CONTRACT_NAME);
      const { v, r, s } = parseSignature(signature);

      const tx = await contract.executeMetaAddMedicalHistory(
        parent,
        childAddress,
        medicalType,
        visitedName,
        timestamp,
        doctorName,
        symptoms,
        diagnosisDetails,
        v,
        r,
        s
      );

      const receipt = await tx.wait();
      res.json({
        success: true,
        data: buildTransactionPayload(contract, receipt),
      });
    } catch (error) {
      handleError(res, "Error adding medical history:", error);
    }
  }

  async updateVaccination(req, res) {
    try {
      const {
        parent,
        childAddress,
        vaccineName,
        vaccineChapter,
        administeredDate,
        signature,
      } = req.body;

      const contract = ethersService.getContract(CONTRACT_NAME);
      const { v, r, s } = parseSignature(signature);

      const tx = await contract.executeMetaUpdateVaccination(
        parent,
        childAddress,
        vaccineName,
        vaccineChapter,
        administeredDate,
        v,
        r,
        s
      );

      const receipt = await tx.wait();
      res.json({
        success: true,
        data: buildTransactionPayload(contract, receipt),
      });
    } catch (error) {
      handleError(res, "Error updating vaccination:", error);
    }
  }

  // const vaccinations = [
  //   {
  //     vaccineName: "DTap",
  //     vaccineChapter: 2, // 2차 입력하면 1차도 자동으로 완료
  //     administerDate: toUnixTimestamp("20241010"),
  //   },
  //   {
  //     vaccineName: "IPV",
  //     vaccineChapter: 1,
  //     administerDate: toUnixTimestamp("20241010"),
  //   },
  // ];
  async updateMultipleVaccinations(req, res) {
    try {
      const { parent, childAddress, vaccinations, signature } = req.body;

      const contract = ethersService.getContract(CONTRACT_NAME);
      const { v, r, s } = parseSignature(signature);

      const tx = await contract.executeMetaUpdateMultipleVaccination(
        parent,
        childAddress,
        vaccinations,
        v,
        r,
        s
      );

      const receipt = await tx.wait();
      res.json({
        success: true,
        data: buildTransactionPayload(contract, receipt),
      });
    } catch (error) {
      handleError(res, "Error updating multiple vaccinations:", error);
    }
  }
}
