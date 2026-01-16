import dotenv from "dotenv";

dotenv.config({
  path: new URL("../../.env", import.meta.url),
});

const parsePort = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const config = {
  ports: {
    http: parsePort(process.env.HTTP_PORT, 8080),
    https: parsePort(process.env.HTTPS_PORT, 8081),
  },
  domainName: process.env.DOMAIN_NAME,
  rpcURL: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
  privateKey: process.env.PRIVATE_KEY,
  contracts: {
    parentChildRelationship: process.env.PARENT_CHILD_RELATIONSHIP_ADDRESS,
  },
};
