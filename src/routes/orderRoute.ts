import express, { Router } from "express";
import orderController from "../controllers/orderController";
import userMiddleware, { Role } from "../middleware/userMiddleware";
import errorHandler from "../services/errorHandler";
const router: Router = express.Router();
router
  .route("/")
  .post(
    userMiddleware.isUserLoggedIn,
    errorHandler(orderController.createOrder)
  )
  .get(
    userMiddleware.isUserLoggedIn,
    errorHandler(orderController.fetchMyOrders)
  );
router
  .route("/verify-pidx")
  .post(
    userMiddleware.isUserLoggedIn,
    errorHandler(orderController.verifyTransaction)
  );
router
  .route("admin/change-order/:id")
  .patch(
    userMiddleware.accessTo(Role.Admin),
    errorHandler(orderController.changeOrderStatus)
  );
router
  .route("/delete-order/:id")
  .delete(
    userMiddleware.accessTo(Role.Admin),
    errorHandler(orderController.deleteOrder)
  );
router
  .route("/cancel-order/:id")
  .patch(
    userMiddleware.isUserLoggedIn,
    errorHandler(orderController.cancelMyOrder)
  );
router.get(
  "/:id",
  userMiddleware.isUserLoggedIn,
  errorHandler(orderController.fetchMyOrder)
);

export default router;