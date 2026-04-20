import { Router } from "express";
import { createBooking, getMyBookings, getAllBookings, updateBookingStatus } from "../controllers/bookingController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

router.post("/", authMiddleware, roleMiddleware("CUSTOMER"), createBooking);
router.get("/my", authMiddleware, roleMiddleware("CUSTOMER"), getMyBookings);
router.get("/", authMiddleware, roleMiddleware("ADMIN"), getAllBookings);
router.put("/:id/status", authMiddleware, roleMiddleware("ADMIN"), updateBookingStatus);

export default router;
