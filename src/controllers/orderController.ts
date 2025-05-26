import { Request, Response } from "express";
import Order from "../database/Models/orderModel";
import OrderDetails from "../database/Models/orderDetails";
import { OrderStatus, PaymentMethod, PaymentStatus } from "../globals/types";
import Payment from "../database/Models/paymentModel";
import axios from "axios";
import Cart from "../database/Models/cartModel";
import Product from "../database/Models/productModel";

interface IProduct {
  productId: string;
  productQty: string;
}

interface OrderRequest extends Request {
  user?: {
    id: string;
  };
}

class OrderWithPaymentId extends Order {
  declare paymentId: string | null;
}

class OrderController {
  static async createOrder(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      addressLine,
      city,
      state,
      zipcode,
      totalAmount,
      paymentMethod,
    } = req.body;
    const products: IProduct[] = req.body.products;
    if (
      !phoneNumber ||
      !addressLine ||
      !city ||
      !state ||
      !zipcode ||
      !firstName ||
      !lastName ||
      !email ||
      !totalAmount ||
      products.length == 0
    ) {
      res.status(400).json({
        message:
          "Please provide phoneNumber,shippingAddress,totalAmount,products",
      });
      return;
    }

    const paymentData = await Payment.create({
      //  orderId: orderData.id,
      paymentMethod: paymentMethod,
    });

    // for order

    const orderData = await Order.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      addressLine,
      city,
      state,
      zipcode,
      totalAmount,
      userId,
      paymentId: paymentData.id,
    });

    let orderDetails;
    // for orderDetails
    products.forEach(async function (product) {
      orderDetails = await OrderDetails.create({
        quantity: product.productQty,
        productId: product.productId,
        orderId: orderData.id,
      });

      await Cart.destroy({
        where: {
          productId: product.productId,
          userId: userId,
        },
      });
    });
    // for payment

    if (paymentMethod == PaymentMethod.Khalti) {
      // khalti logic

      const data = {
        return_url: "http://localhost:5173/",
        website_url: "http://localhost:5173/",
        amount: totalAmount * 100,
        purchase_order_id: orderData.id,
        purchase_order_name: "order_" + orderData.id,
      };
      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "Key a35315b63d7f48318e0170cfd18ffb78",
          },
        }
      );
      const khaltiResponse = response.data;
      paymentData.pidx = khaltiResponse.pidx;
      paymentData.save();
      res.status(200).json({
        message: "Order created successfully",
        url: khaltiResponse.payment_url,
        pidx: khaltiResponse.pidx,
        orderDetails,
      });
    } else if (paymentMethod == PaymentMethod.Esewa) {
    } else {
      res.status(200).json({
        message: "Order created successfully",
        orderDetails,
      });
    }
  }
  static async verifyTransaction(
    req: OrderRequest,
    res: Response
  ): Promise<void> {
    const { pidx } = req.body;
    if (!pidx) {
      res.status(400).json({
        message: "Please provide pidx",
      });
      return;
    }
    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      {
        pidx: pidx,
      },
      {
        headers: {
          Authorization: "Key a35315b63d7f48318e0170cfd18ffb78",
        },
      }
    );
    const data = response.data;
    if (data.status === "Completed") {
      await Payment.update(
        { paymentStatus: PaymentStatus.Paid },
        {
          where: {
            pidx: pidx,
          },
        }
      );
      res.status(200).json({
        message: "Payment verified successfully !!",
      });
    } else {
      res.status(200).json({
        message: "Payment not verified or cancelled",
      });
    }
  }
  static async fetchMyOrders(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const orders = await Order.findAll({
      where: {
        userId,
      },
      attributes: ["totalAmount", "id", "orderStatus"],
      include: {
        model: Payment,
        attributes: ["paymentMethod", "paymentStatus"],
      },
    });
    if (orders.length > 0) {
      res.status(200).json({
        message: "Order fetched successfully",
        data: orders,
      });
    } else {
      res.status(404).json({
        message: "No order found",
        data: [],
      });
    }
  }

  static async fetchMyOrder(req: OrderRequest, res: Response): Promise<void> {
    const orderId = req.params.id;
    const orders = await OrderDetails.findAll({
      where: {
        orderId,
      },
      include: [
        {
          model: Order,
          include: [
            {
              model: Payment,
              attributes: ["paymentMethod", "paymentStatus"],
            },
          ],
        },
        {
          model: Product,
        },
      ],
    });
    if (orders.length > 0) {
      res.status(200).json({
        message: "Order fetched successfully",
        data: orders,
      });
    } else {
      res.status(404).json({
        message: "No order found",
        data: [],
      });
    }
  }

  static async cancelMyOrder(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const orderId = req.params.id;
    const [order] = await Order.findAll({
      where: {
        userId: userId,
        id: orderId,
      },
    });

    if (!order) {
      res.status(404).json({
        message: "No order found",
        data: [],
      });
      return;
    }

    // check order status
    if (
      order.orderStatus === OrderStatus.Ontheway ||
      order.orderStatus === OrderStatus.Preparation
    ) {
      res.status(403).json({
        message: "You cannot cancel the order since your order is on the way !",
        data: [],
      });
      return;
    }
    await Order.update(
      { orderStatus: OrderStatus.Cancelled },
      {
        where: {
          id: orderId,
        },
      }
    );
    res.status(200).json({
      message: "Order cancelled successfully!",
    });
  }

  static async changeOrderStatus(
    req: OrderRequest,
    res: Response
  ): Promise<void> {
    const userId = req.user?.id;
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    if (!orderId) {
      res.status(404).json({
        message: "Please provide orderId and orderStatus",
      });
      return;
    }

    await Order.update(
      { OrderStatus: orderStatus.Cancelled },
      {
        where: {
          id: orderId,
        },
      }
    );
    res.status(200).json({
      message: "Order status updated successfully!",
    });
  }

  static async deleteOrder(req: OrderRequest, res: Response): Promise<void> {
    const orderId = req.params.id;
    const order: OrderWithPaymentId = (await Order.findByPk(
      orderId
    )) as OrderWithPaymentId;
    const paymentId = order?.paymentId;

    if (!order) {
      res.status(404).json({
        message: "Order not found",
      });
      return;
    }

    await OrderDetails.destroy({
      where: {
        id: orderId,
      },
    });
    await Payment.destroy({
      where: {
        id: paymentId,
      },
    });
    await Order.destroy({
      where: {
        id: paymentId,
      },
    });
    res.status(200).json({
      message: "Order deleted successfully!",
    });
  }
}

export default OrderController
