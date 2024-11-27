import e from "express";
import cors from "cors";
import fs from "fs";
import https from "https";
import childRoutes from "./routes/childRoutes.js";

const app = e();
app.use(cors());
app.use(e.json());

app.use("/contract", childRoutes);

const HTTP_PORT = 8080;
const HTTPS_PORT = 8081;

app.listen(HTTP_PORT, () => {
  console.log(`Server is running on port ${HTTP_PORT}`);
});

// HTTPS server
const domainName = process.env.DOMAIN_NAME;
try {
  const keyFile = fs.readFileSync(`/etc/letsencrypt/live/${domainName}/privkey.pem`);
  const certFile = fs.readFileSync(`/etc/letsencrypt/live/${domainName}/fullchain.pem`);
  const options = {
    key: keyFile,
    cert: certFile,
  };

  https.createServer(options, app).listen(HTTPS_PORT, () => {
    console.log(`Server is running on port ${HTTPS_PORT}`);
  });
} catch (error) {
  console.error(`There was a problem while running the server on HTTPS - message: ${error}`);
}
