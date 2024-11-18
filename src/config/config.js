import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({
  path: new URL("../../.env", import.meta.url),
});

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: 8000,
  rpcURL: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    parentChildRelationship: process.env.PARENT_CHILD_RELATIONSHIP_ADDRESS,
  },
};
