import app from "./src/app";
import adminSeeder from "./src/adminSeeder";
import { envConfig } from "./src/config/config";
import categoryController from "./src/controllers/categoryController";
import express from "express";
import path from "path";
import * as http from "http";

const PORT = envConfig.port || 3001;

app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // Optional: seed categories and admin
  await categoryController.seedCategory();
  await adminSeeder();
});
