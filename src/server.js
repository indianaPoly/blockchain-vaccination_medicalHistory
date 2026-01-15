import express from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
import { config } from "./config/config.js";
import childRoutes from "./routes/childRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/contract", childRoutes);

const { http: httpPort, https: httpsPort } = config.ports;

app.listen(httpPort, () => {
  console.log(`Server is running on port ${httpPort}`);
});

const startHttpsServer = () => {
  if (!config.domainName) {
    console.warn("DOMAIN_NAME is not set. Skipping HTTPS server startup.");
    return;
  }

  const keyFile = fs.readFileSync(
    `/etc/letsencrypt/live/${config.domainName}/privkey.pem`
  );
  const certFile = fs.readFileSync(
    `/etc/letsencrypt/live/${config.domainName}/fullchain.pem`
  );

  const options = {
    key: keyFile,
    cert: certFile,
  };

  https.createServer(options, app).listen(httpsPort, () => {
    console.log(`Server is running on port ${httpsPort}`);
  });
};

try {
  startHttpsServer();
} catch (error) {
  console.error(
    `There was a problem while running the server on HTTPS - message: ${error}`
  );
}
