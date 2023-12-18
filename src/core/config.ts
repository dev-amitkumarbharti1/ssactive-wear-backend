import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

interface Config {
    DEV_MONGOURI: string;
    PORT: number;
    JWT_SECRETE_KEY: string;
    PASSWORD_SALT: number;
    SHOPIFY_CLIENT_ID: string;
    SHOPIFY_CLIENT_SECRET: string;
    SHOPIFY_ACCESS_SCOPES: string;
    REDIRECT_URI: string,
    USERNAME: string,
    API_PASSWORD: string
}

const config: Config = {
    DEV_MONGOURI: `${process.env.DEV_MONGOURI}`,
    PORT: parseInt(`${process.env.PORT} || 3000`),
    JWT_SECRETE_KEY: `${process.env.JWT_SECRETE_KEY}`,
    PASSWORD_SALT: parseInt(`${process.env.PASSWORD_SALT}`),
    SHOPIFY_CLIENT_ID: `${process.env.SHOPIFY_CLIENT_ID}`,
    SHOPIFY_CLIENT_SECRET: `${process.env.SHOPIFY_CLIENT_SECRET}`,
    SHOPIFY_ACCESS_SCOPES: `${process.env.SHOPIFY_ACCESS_SCOPES}`,
    REDIRECT_URI: `${process.env.REDIRECT_URI}`,
    USERNAME: `${process.env.SUPPLIER_USER_NAME}`,
    API_PASSWORD: `${process.env.SUPPLIER_API_KEY}`
};

export default config;