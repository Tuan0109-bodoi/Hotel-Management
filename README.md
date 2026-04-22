# Hotel Management System

Full-stack hotel management application with React frontend and Express.js backend.

## Tech Stack

- **Frontend**: React + Vite + Ant Design
- **Backend**: Express.js + Prisma ORM + MySQL
- **Authentication**: JWT-based with role-based access control

## Features

- **Customer**: Browse rooms, multi-room cart, QR payment, manage bookings
- **Admin**: CRUD rooms, manage booking statuses, view dashboard

## Local Development

### Backend

```bash
cd backend
npm install
# Create .env file with your database URL
npx prisma migrate dev
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deploy to Render

### Backend Deployment

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Create a new **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
6. Add Environment Variables:
   - `DATABASE_URL`: Your MySQL database URL
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

### Database Setup

This project uses **TiDB Cloud** (MySQL-compatible serverless database).

**TiDB Cloud Connection:**
- Host: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- Port: `4000`
- Database: `test`
- User: `2D2CgF9X1ercezY.root`

**Environment Variables for Render:**
- `DATABASE_URL`: `mysql://2D2CgF9X1ercezY.root:<YOUR_PASSWORD>@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test`
- `JWT_SECRET`: `Tuanbodoi`
- `NODE_ENV`: `production`
- `PORT`: `10000`

**After deployment, run migrations:**
```bash
npx prisma migrate deploy
npm run seed
```

## Default Credentials

- **Admin**: admin@grandhotel.com / admin123
