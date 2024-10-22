import {Sequelize} from 'sequelize-typescript'
import { envConfig } from '../config/config'

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

sequelize.sync({force : false}).then(()=>{
    console.log("synced !!")
})



export default sequelize