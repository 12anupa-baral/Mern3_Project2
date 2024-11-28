import { Response ,Request} from "express";
import Order from "../database/Models/orderModel";
import { PaymentMethod } from "../globals/types";
import Payment from "../database/Models/paymentModel";
import Product from "../database/Models/productModel";

interface OrderRequest extends Request{
    user? :{
        id:string
    }
}

class OrderController{
    async createOrder(req:OrderRequest,res:Response){
      const userId=  req.user?.id;
        const{phoneNumber,shippingAddress,totalAmount,products,paymetDetails}=req.body
        if(!phoneNumber||!shippingAddress||!totalAmount||products.length==0 ){
res.status(400).json({
    message:"Please fill phonenumber,shippingaddress,total amount,products"
})
return
        }
      const orderData =  await Order.create({
        phoneNumber,
        shippingAddress,
        totalAmount,
        userId

      })
      products.forEach(async function (Product){
      await  orderData.create({
            product:product.productId,
            quantity:product.productQty,
            orderId:orderData.id
            })

        }

      )

      if(paymentMethod ==PaymentMethod.COD){
        await Payment.create({
            orderId:Order.orderId
        })
      }
    }
}

export default new OrderController()