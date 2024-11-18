import hre from "hardhat";
import { ethersService } from "../utils/ethersService.js";

export class ChildController {
  test = async (req, res) => {
    res.json({
      success: true,
      data: {
        value: "hi",
      },
    });
  };

  /*
  {
    "parent": "0x..." (string),
    "childName": "고현림" (string),
    "birthDate": "20241212" (string),
    "height": 120.1 (number),
    "weight": 20.1 (number)
  }
  */
  createChild = async (req, res) => {
    try {
      const { parent, childName, birthDate, height, weight, signature } =
        req.body;

      // contract
      const ethersServiceInstance = new ethersService();
      const contract = await ethersServiceInstance.getContract(
        "parentChildRelationship"
      );

      const { v, r, s } = hre.ethers.Signature.from(signature);

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
        data: {
          transactionHash: receipt.hash,
          events: receipt.logs.map((log) => contract.interface.parseLog(log)),
        },
      });
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  updateHealthInfo = async (req, res) => {
    try {
      const { parent, childAddress, height, weight } = req.body;
      const contract = await ethersService.getContract(
        "parentChildRelationship"
      );

      const nonce = await contract.getNonce(parent);
      const chainId = (await ethersService.provider.getNetwork()).chainId;

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

      const wallet = new ethers.Wallet(ethersService.wallet.privateKey);
      const signature = await wallet.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);

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
        data: {
          transactionHash: receipt.hash,
          events: receipt.logs.map((log) => contract.interface.parseLog(log)),
        },
      });
    } catch (error) {
      console.error("Error updating health info:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  addMedicalHistory = async (req, res) => {
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
      } = req.body;

      const contract = await ethersService.getContract(
        "parentChildRelationship"
      );

      const nonce = await contract.getNonce(parent);
      const chainId = (await ethersService.provider.getNetwork()).chainId;

      const domain = {
        name: "ParentChildRelationshipWithMeta",
        version: "1",
        chainId,
        verifyingContract: contract.target,
      };

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

      const value = {
        parent,
        childAddress,
        medicalType,
        visitedName,
        timestamp,
        doctorName,
        symptoms,
        diagnosisDetails,
        nonce,
      };

      const wallet = new ethers.Wallet(ethersService.wallet.privateKey);
      const signature = await wallet.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);

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
        data: {
          transactionHash: receipt.hash,
          events: receipt.logs.map((log) => contract.interface.parseLog(log)),
        },
      });
    } catch (error) {
      console.error("Error adding medical history:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  updateVaccination = async (req, res) => {
    try {
      const {
        parent,
        childAddress,
        vaccineName,
        vaccineChapter,
        administeredDate,
      } = req.body;
      const contract = await ethersService.getContract(
        "parentChildRelationship"
      );

      const nonce = await contract.getNonce(parent);
      const chainId = (await ethersService.provider.getNetwork()).chainId;

      const domain = {
        name: "ParentChildRelationshipWithMeta",
        version: "1",
        chainId,
        verifyingContract: contract.target,
      };

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

      const value = {
        parent,
        childAddress,
        vaccineName,
        vaccineChapter,
        administeredDate,
        nonce,
      };

      const wallet = new ethers.Wallet(ethersService.wallet.privateKey);
      const signature = await wallet.signTypedData(domain, types, value);
      const { v, r, s } = ethers.Signature.from(signature);

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
        data: {
          transactionHash: receipt.hash,
          events: receipt.logs.map((log) => contract.interface.parseLog(log)),
        },
      });
    } catch (error) {
      console.error("Error updating vaccination:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

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
  updateMultipleVaccinations = async (req, res) => {
    try {
      const { parent, childAddress, vaccinations, signature } = req.body;
      const contract = await ethersService.getContract(
        "parentChildRelationship"
      );

      const { v, r, s } = ethers.Signature.from(signature);

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
        data: {
          transactionHash: receipt.hash,
          events: receipt.logs.map((log) => contract.interface.parseLog(log)),
        },
      });
    } catch (error) {
      console.error("Error updating multiple vaccinations:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };
}
