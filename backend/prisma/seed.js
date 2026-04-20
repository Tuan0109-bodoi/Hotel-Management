import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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
  console.log("Admin user created:", admin.email);

  // Create sample rooms
  const rooms = [
    {
      name: "Standard Single 101",
      type: "SINGLE",
      price: 500000,
      description: "Phong don tieu chuan, phu hop cho khach du lich ca nhan. Dien tich 20m2, cua so nhin thanh pho.",
      imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec99d5d59?w=600",
      maxGuests: 1,
    },
    {
      name: "Standard Single 102",
      type: "SINGLE",
      price: 550000,
      description: "Phong don tieu chuan tang cao, nhin ra ho boi. Dien tich 22m2.",
      imageUrl: "https://images.unsplash.com/photo-1611892440504-8300cdc5c1f4?w=600",
      maxGuests: 1,
    },
    {
      name: "Double Comfort 201",
      type: "DOUBLE",
      price: 800000,
      description: "Phong doi tien nghi, giuong doi lon. Phu hop cho cap doi. Dien tich 30m2.",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
      maxGuests: 2,
    },
    {
      name: "Double Comfort 202",
      type: "DOUBLE",
      price: 850000,
      description: "Phong doi tien nghi co ban cong rieng. Dien tich 32m2.",
      imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
      maxGuests: 2,
    },
    {
      name: "Deluxe Room 301",
      type: "DELUXE",
      price: 1200000,
      description: "Phong Deluxe sang trong, nhin ra bien. Bong tam rieng, mini bar. Dien tich 40m2.",
      imageUrl: "https://images.unsplash.com/photo-1578683010237-d7a413a2924c?w=600",
      maxGuests: 3,
    },
    {
      name: "Deluxe Room 302",
      type: "DELUXE",
      price: 1300000,
      description: "Phong Deluxe cao cap, phong khach rieng. Dien tich 45m2.",
      imageUrl: "https://images.unsplash.com/photo-1591088398332-8a7791973747?w=600",
      maxGuests: 3,
    },
    {
      name: "Royal Suite 401",
      type: "SUITE",
      price: 2500000,
      description: "Suite hoang gia, phong khach rieng, bong tam Jacuzzi, nhin toan canh bien. Dien tich 70m2.",
      imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec99d5d59?w=600",
      maxGuests: 4,
    },
    {
      name: "Presidential Suite 501",
      type: "SUITE",
      price: 5000000,
      description: "Suite Tong thong, 2 phong ngu, phong khach rong, bep nho. Dich vu VIP. Dien tich 120m2.",
      imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
      maxGuests: 6,
    },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { id: rooms.indexOf(room) + 1 },
      update: {},
      create: room,
    });
  }
  console.log("Sample rooms created:", rooms.length);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
