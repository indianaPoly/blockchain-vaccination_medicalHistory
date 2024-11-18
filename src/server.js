import e from "express";
import cors from "cors";
import childRoutes from "./routes/childRoutes.js";

const app = e();
app.use(
  cors({
    origin: "http://localhost:3000", // React 기본 포트
    credentials: true,
  })
);
app.use(e.json());

app.use("/contract", childRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
