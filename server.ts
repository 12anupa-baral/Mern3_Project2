import app from "./src/app";
import adminSeeder from "./src/adminSeeder";
import { envConfig } from "./src/config/config";
import categoryController from "./src/controllers/categoryController";
import express from "express";
import path from "path";
import * as http from "http";
import { Server } from "socket.io";
import jwt, { VerifyErrors } from "jsonwebtoken";
import User from "./src/database/Models/userModel";
function startServer() {
  const port = envConfig.port || 3001;
  app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));
  const server = app.listen(port, () => {
    categoryController.seedCategory();
    console.log(`server started at ${port}`);
    adminSeeder();
  });
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  let onlineUser: { socketId: string; userId: string; role: string }[] = [];
  let addToOnlineUser = (socketId: string, userId: string, role: string) => {
    onlineUser = onlineUser.filter((user) => user.userId != userId);
    onlineUser.push({ socketId, userId, role });
  };
  io.on("connection", (socket) => {
    const { token } = socket.handshake.auth; //jwt token
    if (token) {
      jwt.verify(
        token,
        envConfig.jwt as string,
        async (err: VerifyErrors | null, result: any) => {
          if (err) {
            socket.emit("error", err);
          } else {
            const userData = await User.findByPk(result.userId); // {email:"",pass:"",role:""}
            if (!userData) {
              socket.emit("error", "no user found with that token");
              return;
            }
            addToOnlineUser(socket.id, result.userId, userData.role);
          }
        }
      );
    }
  });
}

startServer();
