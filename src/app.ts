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
app.use(cors());

// localhost:3000/api/auth/
app.use("/api/auth", userRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/order", OrderRoute);
app.use("/api/cart", CartRoute);

export default app;
