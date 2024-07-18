import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/auth.routes.js";
import { FRONTEND_URL, PORT } from "./config.js";
import { connectDB } from "./db.js";
import User from './models/user.model.js';
import bcrypt from 'bcryptjs';

// Definir __dirname
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createAdminUser() {
  const adminEmail = "admin@example.com";
  const adminUsername = "admin";
  const adminPassword = "adminpassword";

  const userFound = await User.findOne({ email: adminEmail });

  if (!userFound) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    const newUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: passwordHash,
      role: "admin",
    });

    await newUser.save();
    console.log("Admin user created");
  } else {
    console.log("Admin user already exists");
  }
}

async function main() {
  try {
    await connectDB();
    await createAdminUser();

    const app = express();

    app.use(
      cors({
        credentials: true,
        origin: FRONTEND_URL,
      })
    );
    app.use(express.json());
    app.use(morgan("dev"));
    app.use(cookieParser());

    app.use("/api/auth", authRoutes);

    if (process.env.NODE_ENV === "production") {
      const path = await import("path");
      app.use(express.static("client/dist"));

      app.get("*", (req, res) => {
        res.sendFile(path.resolve("client", "dist", "index.html"));
      });
    }

    app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error(error);
  }
}

main();
