import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config({
  path: new URL("../../.env", import.meta.url),
});

const __dirname = dirname(fileURLToPath(import.meta.url));

export const config = {
  port: 3000,
  rpcURL: "http://127.0.0.1:8545",
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    parentChildRelationship: process.env.PARENT_CHILD_RELATIONSHIP_ADDRESS,
  },
};
