import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedIfEmpty() {
  try {
    console.log("Checking if database needs seeding...");
    
    // Check if database already has data
    const roomCount = await prisma.room.count();
    if (roomCount > 0) {
      console.log(`✅ Database already has ${roomCount} rooms. Skipping seed.`);
      return;
    }

    console.log("🌱 Database is empty. Seeding now...");

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@grandhotel.com" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@grandhotel.com",
        password: adminPassword,
        phone: "0900000000",
        role: "ADMIN",
      },
    });
    console.log("✅ Admin user created:", admin.email);

    // Create sample rooms
    const rooms = [
      {
        name: "Standard Single 101",
        type: "SINGLE",
        price: 500000,
        description: "Phong don tieu chuan, phu hop cho khach du lich ca nhan. Dien tich 20m2, cua so nhin thanh pho.",
        imageUrl: "/uploads/rooms/single-101.png",
        maxGuests: 1,
      },
      {
        name: "Standard Single 102",
        type: "SINGLE",
        price: 550000,
        description: "Phong don tieu chuan tang cao, nhin ra ho boi. Dien tich 22m2.",
        imageUrl: "/uploads/rooms/single-102.png",
        maxGuests: 1,
      },
      {
        name: "Double Comfort 201",
        type: "DOUBLE",
        price: 800000,
        description: "Phong doi tien nghi, giuong doi lon. Phu hop cho cap doi. Dien tich 30m2.",
        imageUrl: "/uploads/rooms/double-201.png",
        maxGuests: 2,
      },
      {
        name: "Double Comfort 202",
        type: "DOUBLE",
        price: 850000,
        description: "Phong doi tien nghi co ban cong rieng. Dien tich 32m2.",
        imageUrl: "/uploads/rooms/double-202.png",
        maxGuests: 2,
      },
      {
        name: "Deluxe Room 301",
        type: "DELUXE",
        price: 1200000,
        description: "Phong Deluxe sang trong, nhin ra bien. Bong tam rieng, mini bar. Dien tich 40m2.",
        imageUrl: "/uploads/rooms/deluxe-301.png",
        maxGuests: 3,
      },
      {
        name: "Deluxe Room 302",
        type: "DELUXE",
        price: 1300000,
        description: "Phong Deluxe cao cap, phong khach rieng. Dien tich 45m2.",
        imageUrl: "/uploads/rooms/deluxe-302.png",
        maxGuests: 3,
      },
      {
        name: "Royal Suite 401",
        type: "SUITE",
        price: 2500000,
        description: "Suite hoang gia, phong khach rieng, bong tam Jacuzzi, nhin toan canh bien. Dien tich 70m2.",
        imageUrl: "/uploads/rooms/suite-401.png",
        maxGuests: 4,
      },
      {
        name: "Presidential Suite 501",
        type: "SUITE",
        price: 5000000,
        description: "Suite Tong thong, 2 phong ngu, phong khach rong, bep nho. Dich vu VIP. Dien tich 120m2.",
        imageUrl: "/uploads/rooms/suite-501.png",
        maxGuests: 6,
      },
    ];

    for (const room of rooms) {
      await prisma.room.create({ data: room });
    }
    console.log(`✅ Created ${rooms.length} sample rooms`);

    console.log("🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedIfEmpty();
