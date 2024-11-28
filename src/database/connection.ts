import {Sequelize} from 'sequelize-typescript'
import { envConfig } from '../config/config'
import Product from './Models/productModel';
import Category from './Models/categoryModel';
import User from './Models/userModel'
import Order from './Models/orderModel'
import Payment from './Models/paymentModel'
import OrderDetails from './Models/orderDetails'

const connString = envConfig.connectionString ;
if (!connString) {
    throw new Error("Connection string is not defined in the environment variables.");
}

const sequelize = new Sequelize(connString,{
    dialect: envConfig.dialect as any,
    models: [__dirname + '/Models'], 
});

try {
    sequelize.authenticate()
    .then(()=>{
        console.log("Database connected successfully !!!")
    })
    .catch(err=>{
        console.log("Error occured", err)
    })
} catch (error) {
    console.log(error)
}

sequelize.sync({force : false, alter: true }).then(() => {
    console.log("Database & tables synced!");
}).catch((error) => {
    console.error("Error syncing database:", error);
});
// relationships // 
Category.hasOne(Product,{foreignKey:'categoryId'})
Product.belongsTo(Category,{foreignKey:'categoryId'})
// User X Order
User.hasMany(Order,{foreignKey:'userId'})
Order.belongsTo(User,{foreignKey:'userId'})
// Payment X Order 
Order.hasOne(Payment,{foreignKey:'orderId'})
Payment.belongsTo(Order,{foreignKey:'orderId'})
Order.hasOne(OrderDetails,{foreignKey:'orderId'})
OrderDetails.belongsTo(Order,{foreignKey:'orderId'})

Product.hasMany(OrderDetails,{foreignKey:'productId'})
OrderDetails.belongsTo(Product,{foreignKey:'productId'})



export default sequelize