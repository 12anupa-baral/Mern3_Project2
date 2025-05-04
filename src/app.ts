import express from "express";
import "./database/connection";
import userRoute from "./routes/userRoute";
import User from "./database/Models/userModel";
import categoryRoute from "./routes/categoryRoute";
import productRoute from "./routes/productRoute";
import OrderRoute from "./routes/orderRoute";
import CartRoute from "./routes/cartRoute";

import cors from "cors";

const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-proj2-frontend-ifj9.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/order", OrderRoute);
app.use("/api/cart", CartRoute);

app.use(express.static("./src/uploads"));

export default app;
