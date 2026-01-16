import hre from "hardhat";
import { config } from "../config/config.js";

import ParentChildRelationshipABI from "../../artifacts/contracts/MetaParentChildRelationship.sol/ParentChildRelationshipWithMeta.json" assert { type: "json" };

class EthersService {
  constructor() {
    this.provider = new hre.ethers.JsonRpcProvider(config.rpcURL);
    this.wallet = new hre.ethers.Wallet(config.privateKey, this.provider);
    this.contracts = {
      parentChildRelationship: new hre.ethers.Contract(
        config.contracts.parentChildRelationship,
        ParentChildRelationshipABI.abi,
        this.wallet
      ),
    };
  }

  getContract(name) {
    const contract = this.contracts[name];
    if (!contract) {
      throw new Error(`Contract not found: ${name}`);
    }
    return contract;
  }

  getProvider() {
    return this.provider;
  }

  getWallet() {
    return this.wallet;
  }
}

export const ethersService = new EthersService();
