import prisma from "../utils/prisma.js";
import { datesOverlap, calculateNights } from "../utils/dateUtils.js";

export const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId: req.user.id },
      include: { room: true },
      orderBy: { createdAt: "desc" },
    });

    const totalAmount = cartItems.reduce((sum, item) => {
      const nights = calculateNights(item.checkInDate, item.checkOutDate);
      return sum + item.room.price * nights;
    }, 0);

    res.json({ items: cartItems, totalAmount });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "roomId, checkInDate, and checkOutDate are required." });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    // Check if room exists and is available
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    if (room.status === "MAINTENANCE") {
      return res.status(400).json({ message: "Room is under maintenance." });
    }

    // Check for booking conflicts
    const conflictingBookings = await prisma.bookingDetail.findFirst({
      where: {
        roomId,
        booking: {
          status: { in: ["PENDING", "CHECKED_IN"] },
          checkInDate: { lt: checkOut },
          checkOutDate: { gt: checkIn },
        },
      },
    });

    if (conflictingBookings) {
      return res.status(400).json({ message: "Room is already booked for the selected dates." });
    }

    // Check if already in user's cart with overlapping dates
    const existingCartItem = await prisma.cart.findFirst({
      where: {
        userId: req.user.id,
        roomId,
        checkInDate: { lt: checkOut },
        checkOutDate: { gt: checkIn },
      },
    });

    if (existingCartItem) {
      return res.status(400).json({ message: "This room is already in your cart for overlapping dates." });
    }

    const cartItem = await prisma.cart.create({
      data: {
        userId: req.user.id,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
      },
      include: { room: true },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.body;

    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const newCheckIn = new Date(checkInDate || cartItem.checkInDate);
    const newCheckOut = new Date(checkOutDate || cartItem.checkOutDate);

    if (newCheckIn >= newCheckOut) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    // Re-validate booking conflicts with new dates
    const conflictingBookings = await prisma.bookingDetail.findFirst({
      where: {
        roomId: cartItem.roomId,
        booking: {
          status: { in: ["PENDING", "CHECKED_IN"] },
          checkInDate: { lt: newCheckOut },
          checkOutDate: { gt: newCheckIn },
        },
      },
    });

    if (conflictingBookings) {
      return res.status(400).json({ message: "Room is already booked for the selected dates." });
    }

    const updated = await prisma.cart.update({
      where: { id: cartItem.id },
      data: { checkInDate: newCheckIn, checkOutDate: newCheckOut },
      include: { room: true },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const cartItem = await prisma.cart.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized." });
    }

    await prisma.cart.delete({ where: { id: cartItem.id } });
    res.json({ message: "Item removed from cart." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    await prisma.cart.deleteMany({ where: { userId: req.user.id } });
    res.json({ message: "Cart cleared." });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
