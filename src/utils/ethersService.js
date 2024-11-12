import hre from "hardhat";
import { config } from "../config/config.js";

import ParentChildRelationshipABI from "../../artifacts/contracts/MetaParentChildRelationship.sol/ParentChildRelationshipWithMeta.json" assert { type: "json" };

export class ethersService {
  constructor() {
    this.provider = new hre.ethers.JsonRpcProvider(config.rpcURL);
    this.wallet = new hre.ethers.Wallet(config.privateKey, this.provider);
    this.contracts = {
      parentChildRelationship: new hre.ethers.Contract(
        config.contracts.parentChildRelationship,
        ParentChildRelationshipABI,
        this.wallet
      ),
    };
  }

  getContract = async (name) => {
    return this.contracts[name];
  };
}
