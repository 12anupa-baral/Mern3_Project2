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
    userMiddleware.accessTo(Role.Customer),
    errorHandler(CartController.addToCart)
  )
  .get(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer),
    errorHandler(CartController.getCartItems)
  )

  router.route("/:productId")
  .delete(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer),
      errorHandler(CartController.deleteCartItem))

    .patch(
    userMiddleware.isUserLoggedIn,
    userMiddleware.accessTo(Role.Customer),
    errorHandler(CartController.updateCartItemQuantity)
  )
  
export default router;
