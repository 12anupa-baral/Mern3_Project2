import express, { Router } from "express";
import categoryController from "../controllers/categoryController";
import userMiddleware, { Role } from "../middleware/userMiddleware";
import errorHandler from "../services/errorHandler";
import CartController from "../controllers/CartController";
const router: Router = express.Router();
router
  .route("/")
  .post(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer, Role.Admin),
    errorHandler(CartController.addToCart)
  )
  .get(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer, Role.Admin),
    errorHandler(CartController.getCartItems)
  );

router
  .route("/:productId")
  .delete(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer, Role.Admin),
    errorHandler(CartController.deleteCartItem)
  )

  .patch(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer, Role.Admin),
    errorHandler(CartController.updateCartItemQuantity)
  );
  
export default router;
