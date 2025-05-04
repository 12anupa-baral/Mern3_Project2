// import adminSeeder from "./src/adminSeeder";
// import app from "./src/app";
// import { envConfig } from "./src/config/config";
// import categoryController from "./src/controllers/categoryController";
// import { Server } from "socket.io";
// import jwt from "jsonwebtoken";
// import User from "./src/database/Models/userModel";
// import Order from "./src/database/Models/orderModel";

// interface OnlineUser {
//   socketId: string;
//   userId: string;
//   role: string;
// }

// function startServer() {
//   const port = envConfig.port || 4000;
//   const server = app.listen(port, async () => {
//     try {
//       await categoryController.seedCategory();
//       await adminSeeder();
//       console.log(` Server started at http://localhost:${port}`);
//     } catch (err) {
//       console.error(" Failed to seed data:", err);
//     }
//   });

//   const io = new Server(server, {
//     cors: {
//       origin: "*",
//     },
//   });

//   let onlineUsers: OnlineUser[] = [];

//   const addToOnlineUsers = (socketId: string, userId: string, role: string) => {
//     onlineUsers = onlineUsers.filter((user) => user.userId !== userId);
//     onlineUsers.push({ socketId, userId, role });
//   };

//   const removeFromOnlineUsers = (socketId: string) => {
//     onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
//   };

//   io.on("connection", (socket) => {
//     console.log("New socket connection:", socket.id);

//     const token = socket.handshake.headers.token as string;

//     if (!token) {
//       console.warn(" No token provided");
//       socket.emit("error", "Please provide a valid token");
//       socket.disconnect();
//       return;
//     }

//     jwt.verify(token, envConfig.jwt as string, async (err, decoded: any) => {
//       if (err || !decoded?.userId) {
//         console.error(" JWT verification failed:", err);
//         socket.emit("error", "Invalid token");
//         socket.disconnect();
//         return;
//       }

//       try {
//         const user = await User.findByPk(decoded.userId);
//         if (!user) {
//           socket.emit("error", "User not found");
//           socket.disconnect();
//           return;
//         }

//         addToOnlineUsers(socket.id, user.id, user.role);
//         console.log(`👤 User [${user.role}] connected: ${user.id}`);
//         console.log("📋 Online Users:", onlineUsers);
//       } catch (dbErr) {
//         console.error(" Error fetching user from DB:", dbErr);
//         socket.emit("error", "Server error");
//         socket.disconnect();
//       }
//     });

//     // Order status update handler
//     socket.on("updateOrderStatus", async (data) => {
//       let payload;
//       try {
//         payload = typeof data === "string" ? JSON.parse(data) : data;
//       } catch (err) {
//         console.error(" Invalid JSON format:", err);
//         socket.emit("error", "Invalid data format");
//         return;
//       }

//       const { status, orderId, userId } = payload;
//       if (!status || !orderId || !userId) {
//         socket.emit(
//           "error",
//           "Missing required fields: status, orderId, or userId"
//         );
//         return;
//       }

//       try {
//         const [updated] = await Order.update(
//           { orderStatus: status },
//           { where: { id: orderId } }
//         );
//         if (!updated) {
//           socket.emit("error", "Order not found or not updated");
//           return;
//         }
//         console.log(` Order ${orderId} updated to: ${status}`);
//       } catch (err) {
//         console.error(" Failed to update order:", err);
//         socket.emit("error", "Database update failed");
//         return;
//       }

//       const targetUser = onlineUsers.find((u) => u.userId === userId);
//       if (targetUser) {
//         io.to(targetUser.socketId).emit("statusUpdated", payload);
//         console.log(" Status update sent to:", targetUser.socketId);
//       } else {
//         socket.emit("error", "Target user is not online");
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log(" Socket disconnected:", socket.id);
//       removeFromOnlineUsers(socket.id);
//       console.log("Online users after disconnect:", onlineUsers);
//     });
//   });
// }

// startServer();

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
    const token = socket.handshake.headers.token; //jwt token
    if (token) {
      jwt.verify(
        token as string,
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
            console.log(onlineUser);
          }
        }
      );
    } else {
      socket.emit("error", "no token found");
    }
    socket.on("updateOrderStatus", (data) => {
      const { status, orderId, userId } = data;
      const finduser = onlineUser.find((user) => user.userId == userId);
      if (finduser) {
        io.to(finduser.socketId).emit("success", "order status updated");
      } else {
        socket.emit("error", "user not online");
      }
    });
    console.log("Online users:", onlineUser);
  });
}

startServer();
