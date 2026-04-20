import { Router } from "express";
import { getRooms, getAvailableRooms, getRoomById, createRoom, updateRoom, deleteRoom } from "../controllers/roomController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", getRooms);
router.get("/available", getAvailableRooms);
router.get("/:id", getRoomById);
router.post("/", authMiddleware, roleMiddleware("ADMIN"), createRoom);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateRoom);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteRoom);

export default router;
