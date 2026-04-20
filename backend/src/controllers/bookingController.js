import prisma from "../utils/prisma.js";
import { calculateNights } from "../utils/dateUtils.js";

export const createBooking = async (req, res) => {
  try {
    const { customerNote } = req.body;
    const userId = req.user.id;

    // Get cart items
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { room: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    // Re-validate all rooms for booking conflicts
    for (const item of cartItems) {
      const conflictingBookings = await prisma.bookingDetail.findFirst({
        where: {
          roomId: item.roomId,
          booking: {
            status: { in: ["PENDING", "CHECKED_IN"] },
            checkInDate: { lt: item.checkOutDate },
            checkOutDate: { gt: item.checkInDate },
          },
        },
      });

      if (conflictingBookings) {
        return res.status(400).json({
          message: `Room "${item.room.name}" is no longer available for the selected dates. Please remove it from cart and try again.`,
        });
      }
    }

    // Use the earliest checkIn and latest checkOut for the booking
    const checkInDate = cartItems.reduce((min, item) => (item.checkInDate < min ? item.checkInDate : min), cartItems[0].checkInDate);
    const checkOutDate = cartItems.reduce((max, item) => (item.checkOutDate > max ? item.checkOutDate : max), cartItems[0].checkOutDate);

    // Calculate total amount
    let totalAmount = 0;
    const bookingDetailsData = [];

    for (const item of cartItems) {
      const nights = calculateNights(item.checkInDate, item.checkOutDate);
      const priceAtBooking = item.room.price * nights;
      totalAmount += priceAtBooking;

      bookingDetailsData.push({
        roomId: item.roomId,
        priceAtBooking: item.room.price,
      });
    }

    // Create booking with details in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId,
          checkInDate,
          checkOutDate,
          totalAmount,
          customerNote,
          bookingDetails: {
            create: bookingDetailsData,
          },
        },
        include: {
          bookingDetails: { include: { room: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      });

      // Clear the cart
      await tx.cart.deleteMany({ where: { userId } });

      return newBooking;
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        bookingDetails: { include: { room: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        bookingDetails: { include: { room: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validTransitions = {
      PENDING: ["CHECKED_IN", "CANCELLED"],
      CHECKED_IN: ["CHECKED_OUT"],
      CHECKED_OUT: [],
      CANCELLED: [],
    };

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { bookingDetails: true },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!validTransitions[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${booking.status} to ${status}.`,
      });
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.update({
        where: { id: booking.id },
        data: { status },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          bookingDetails: { include: { room: true } },
        },
      });

      // Update room statuses based on booking status
      if (status === "CHECKED_IN") {
        const roomIds = booking.bookingDetails.map((d) => d.roomId);
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: "OCCUPIED" },
        });
      } else if (status === "CHECKED_OUT") {
        const roomIds = booking.bookingDetails.map((d) => d.roomId);
        await tx.room.updateMany({
          where: { id: { in: roomIds } },
          data: { status: "AVAILABLE" },
        });
      } else if (status === "CANCELLED") {
        const roomIds = booking.bookingDetails.map((d) => d.roomId);
        await tx.room.updateMany({
          where: { id: { in: roomIds }, status: "OCCUPIED" },
          data: { status: "AVAILABLE" },
        });
      }

      return updated;
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
