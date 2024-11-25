import e from "express";
import cors from "cors";
import childRoutes from "./routes/childRoutes.js";

const app = e();
app.use(cors());
app.use(e.json());

app.use("/contract", childRoutes);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
