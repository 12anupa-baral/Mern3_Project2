import { Response ,Request, response} from "express";
import Order from "../database/Models/orderModel";
import { PaymentMethod } from "../globals/types";
import Payment from "../database/Models/paymentModel";
import OrderDetails from "../database/Models/orderDetails";
import axios from 'axios';
interface IProduct{
  productId : string, 
  productQty : string 
}

interface OrderRequest extends Request{
    user? :{
        id:string
    }
}

class OrderController{
    async createOrder(req:OrderRequest,res:Response){
      const userId=  req.user?.id;
        const{phoneNumber,shippingAddress,totalAmount,paymentMethod}=req.body
        const products:IProduct[] = req.body.products
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
      products.forEach(async function(product){
        await OrderDetails.create({
            quantity : product.productQty, 
            productId : product.productId, 
            orderId : orderData.id
        })
      })
      // for payment 
      const paymentData= await Payment.create({
        orderId : orderData.id, 
        paymentMethod : paymentMethod, 
    })
      if(paymentMethod == PaymentMethod.COD){
        const data={
          return_url:"https://localhost:5173/",
          website_url:"https://localhost:5173/",
          amount:totalAmount*100,  //rupees to paisa
          purchase_order_id:orderData.id,
          purchase_order_name:"order_"+orderData.id
        }
        const response =  await axios.post("https://a.khalti.com/api/v2/epayment/initiate",data,{
        headers:{
          authorization:"key a35315b63d7f48318e0170cfd18ffb78"
        }
       })
       const khaltiResponse = response.data 
       paymentData.pidx = khaltiResponse.pidx
       paymentData.save()
       res.status(200).json({
         message : "Order created successfully", 
         url : khaltiResponse.payment_url
       })


      }else{
        // esewa logic
      }
     
    }
}

export default new OrderController()