import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", authMiddleware, roleMiddleware("CUSTOMER"), getCart);
router.post("/", authMiddleware, roleMiddleware("CUSTOMER"), addToCart);
router.put("/:id", authMiddleware, roleMiddleware("CUSTOMER"), updateCartItem);
router.delete("/:id", authMiddleware, roleMiddleware("CUSTOMER"), removeCartItem);
router.delete("/clear/all", authMiddleware, roleMiddleware("CUSTOMER"), clearCart);

export default router;
