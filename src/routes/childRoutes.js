import e from "express";
import { ChildController } from "../controllers/childController.js";

const router = e.Router();
const childController = new ChildController();

router.get("/test", childController.test);
router.post("/create", childController.createChild);
router.post("/health/update", childController.updateHealthInfo);
router.post("/medical/add", childController.addMedicalHistory);
router.post("/vaccination/update", childController.updateVaccination);
router.post(
  "/vaccination/updateMulti",
  childController.updateMultipleVaccinations
);

export default router;
