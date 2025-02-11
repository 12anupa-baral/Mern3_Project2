import { config } from "dotenv";
config();

export const envConfig = {
  port: process.env.PORT,
  connectionString: process.env.CONNECTION_STRING,
  dialect: process.env.DIALECT,
  jwt: process.env.JWT_SECRET_KEY,
  expiresIn: process.env.JWT_EXPIRES_IN,
  email: process.env.EMAIL,
  emailPassword: process.env.EMAILPASSWORD,
  adminPassword: process.env.ADMIN_PASSWORD,
  adminUsername: process.env.ADMIN_USERNAME,
  adminEmail: process.env.ADMIN_EMAIL,
};
