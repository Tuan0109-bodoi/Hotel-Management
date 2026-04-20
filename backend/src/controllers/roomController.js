import prisma from "../utils/prisma.js";
import { datesOverlap } from "../utils/dateUtils.js";

export const getRooms = async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice } = req.query;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const rooms = await prisma.room.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getAvailableRooms = async (req, res) => {
  try {
    const { checkIn, checkOut, type } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "checkIn and checkOut dates are required." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: "Check-out date must be after check-in date." });
    }

    // Find rooms that have conflicting bookings in the date range
    const conflictingBookings = await prisma.bookingDetail.findMany({
      where: {
        booking: {
          status: { in: ["PENDING", "CHECKED_IN"] },
          checkInDate: { lt: checkOutDate },
          checkOutDate: { gt: checkInDate },
        },
      },
      select: { roomId: true },
    });

    const conflictingRoomIds = [...new Set(conflictingBookings.map((b) => b.roomId))];

    const where = {
      status: "AVAILABLE",
      id: { notIn: conflictingRoomIds },
    };
    if (type) where.type = type;

    const rooms = await prisma.room.findMany({ where, orderBy: { price: "asc" } });

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: parseInt(req.params.id) } });

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, type, price, description, imageUrl, maxGuests } = req.body;

    if (!name || !type || !price) {
      return res.status(400).json({ message: "Name, type, and price are required." });
    }

    const room = await prisma.room.create({
      data: { name, type, price: parseFloat(price), description, imageUrl, maxGuests: maxGuests ? parseInt(maxGuests) : 2 },
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const { name, type, price, description, imageUrl, status, maxGuests } = req.body;

    const room = await prisma.room.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(status && { status }),
        ...(maxGuests !== undefined && { maxGuests: parseInt(maxGuests) }),
      },
    });

    res.json(room);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Room not found." });
    }
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Room deleted successfully." });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Room not found." });
    }
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};
