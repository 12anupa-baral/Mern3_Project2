import { Request, Response } from "express"
import Cart from "../database/Models/cartModel"
import Product from "../database/Models/productModel";

interface AuthRequest extends Request{
    user?: {
        id:string
    }
}

class CartController {
  async addToCart(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
    if (productId || !quantity) {
      res.status(400).json({
        message: "Please provide productId,quantity",
      });
      return;
    }

    //check if that item already exist on that user cart
    let cartOfUser = await Cart.findOne({
      where: {
        userId,
        productId,
      },
    });

    //select * from cart where productId=?userId=?
    if (cartOfUser) {
      cartOfUser.quantity += quantity;
      cartOfUser.save();
    } else {
      await Cart.create({
        userId,
        productId,
        quantity,
      });
    }
    res.status(200).json({
      message: "Item added to cart",
    });
  }

  async getCartItems(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const cartItems = await Cart.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "productName", "productPrice", "productImgUrl"],
        },
      ],
    });
    if (cartItems.length === 0) {
      res.status(404).json({ message: "No items in cart" });
    } else {
      res.status(200).json({
        message: "Cart items",
        data: cartItems,
      });
    }
  }
    async deleteCartItem(req: AuthRequest, res: Response) {
        const userId = req.user?.id;
        const { productId } = req.params;
        //check if product exist or not
        const cartItem = await Product.findByPk()
        if (!Product) {
            res.status(404).json({ message: "Product not found" });
            return
        }
        await Cart.destroy({
            where: {
                productId,
                userId,
            }
        });
        res.status(200).json({
            message: "Item deleted from cart",
        })
      
    }
    
    async updateCartItemQuantity(req: AuthRequest, res: Response) {
        const userId = req.user?.id;
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!quantity) {
            res.status(400).json({ message: "Quantity is required" });
            return
        }
        const cartItem = await Cart.findOne({
            where: {
                userId,
                productId
                }
        })
        if(!cartItem)
        {
            res.status(404).json({ message: "Item not found in cart" });
           
        }
        else {
            cartItem.quantity = quantity
            await cartItem.save()
            res.status(200).json({
                message: "Quantity updated",
            })
            
        }
    }
}

export default new CartController()