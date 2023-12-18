import { Request, Response } from "express";
import { User } from "../database/controllers/user";

import { UserValidator } from "../../core/validator/user/userValidator";
import config from "../../core/config";
import { post } from "../../core/http";
import { ShopifyApi } from "../../core/shopify/shopify";


const user = new User();

const userValidator = new UserValidator();

export class UserService {
    register = async (req: Request, res: Response) => {
        const { error } = userValidator.register(req.body);
        if (error) return res.status(400).send(error.message);
        const result = await user.registerUser(req.body);
        const statusCode = result.status ?? 500;
        res.status(statusCode).send(result);
    };

    login = async (req: Request, res: Response) => {
        const { error } = userValidator.login(req.body);
        if (error) return res.status(400).send(error.message);
        const response = await user.userLogin(req.body);
        const statusCode = response.status ?? 500;
        delete response.status;
        const data = response.success === true ? response.data : {};

        delete response.data;
        res.status(statusCode).send({ ...response, ...data });
    };

    resetPassword = async (req: Request, res: Response) => {
        const { error } = userValidator.resetPassword(req.body);
        if (error) return res.status(400).send(error.message);
        const { email } = req.body;
        const response = await user.resetPassword(email);
        const statusCode = response.status ?? 500;
        const data = response.success === true ? response.data : response.message;
        res.status(statusCode).send(response);
    };

    changePassword = async (req: Request, res: Response) => {
        const { error } = userValidator.changePassword(req.body);
        if (error) return res.status(400).send(error.message);

        const { token: password_reset_token, new_password } = req.body;
        const response = await user.changePassword(password_reset_token, new_password);
        const statusCode = response.status ?? 500;
        res.status(statusCode).send(response);
    };


    onBoard = async (req: Request, res: Response) => {
        const { error } = userValidator.onBoard(req.body);
        if (error) return res.status(400).send(error.message);
        const response = await user.submitOnborading(req.body, req.user._id);
        res.status(response.status).send(response);
    };

    verifyAccount = async (req: Request, res: Response) => {
        const { error } = userValidator.verifyOtp(req.body);
        if (error) return res.status(400).send(error.message);
        const response = await user.verifyOtp(req.body);
        const statusCode = response.status ?? 500;
        res.status(statusCode).send(response);
    };

    reSendOtp = async (req: Request, res: Response) => {
        const { error } = userValidator.reSendOtp(req.body);
        if (error) return res.status(400).send(error.message);
        const response = await user.sendOpt(req.body);
        const statusCode = response.status ?? 500;
        res.status(statusCode).send(response);
    }

    getInfo = async (req: Request, res: Response) => {
        const response = await user.info(req.user._id);
        const statusCode = response.status ?? 500;
        res.status(statusCode).send(response);
    }

    logout = async (req: Request, res: Response) => {

        // const userId = req.user._id;

        // await redisClient.del(`elixir_token_${userId}`)


        res.send({ status: 200, message: "logged out successfully", success: true })
    }

    // priceSetting = async (req: Request, res: Response) => {
    //     const { error } = userValidator.savePriceSetting(req.body);
    //     if (error) return res.status(400).send(error.message);
    //     const userId = req.user._id;
    //     const response = await user.savePriceSetting(req.body, userId);
    //     return res.status(response.status).send(response);
    // }

    // currencySetting = async (req: Request, res: Response) => {
    //     const { error } = userValidator.currencySetting(req.body);
    //     if (error) return res.status(400).send(error.message);
    //     const userId = req.user._id;
    //     const response = await user.saveCurrencySetting(req.body, userId);
    //     return res.status(response.status).send(response);
    // }

    // uploadOriginalPriceSetting = async (req: Request, res: Response) => {
    //     const { error } = userValidator.uploadoriginalPrice(req.body);
    //     if (error) return res.status(400).send(error.message);
    //     const userId = req.user._id;
    //     const response = await user.saveUploadPriceSetting(req.body, userId);
    //     res.status(response.status).send(response);
    // }

    settings = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const response = await user.getSetting(userId);
        res.status(response.status).send(response);
    }

    installApp = (req: Request, res: Response) => {
        const shop = req.body.shop;
        const url = `https://${shop}/admin/oauth/authorize?client_id=${config.SHOPIFY_CLIENT_ID}&scope=${config.SHOPIFY_ACCESS_SCOPES}&redirect_uri=${config.REDIRECT_URI}/api/user/install/callback`;
        res.send({ installationUrl: url });
    };

    callBack = async (req: Request, res: Response) => {
        console.log("CallBack");
        const { shop, code } = req.query;
        const accessTokenResponse = await post(
            `https://${shop}/admin/oauth/access_token`,
            {
                'client_id': config.SHOPIFY_CLIENT_ID,
                'client_secret': config.SHOPIFY_CLIENT_SECRET,
                'code': code
            }
        );
        const accessToken = accessTokenResponse.data.access_token;
        const shopifyApi = new ShopifyApi(shop as string, accessToken).getShopifyObj();
        const locations = await shopifyApi.location.list();
        const locationsList = locations.map((location, index) => { return { id: location.id, name: location.name, admin_graphql_api_id: location.admin_graphql_api_id, active: location.active, selected: (index == 0) ? true : false } });

        const getSalesChannelQuery = `
                query publications {
                    publications(first: 5) {
                      edges {
                        node {
                          id
                          name
                          supportsFuturePublishing
                        }
                      }
                    }
                  }
                 `;

        const salesChannelResponse = await shopifyApi.graphql(getSalesChannelQuery);
        const publicationChannel = salesChannelResponse.publications.edges.find((edge: { [key: string]: any }) => edge.node.name == "Online Store");



        //const isSaved = await user.saveAccessToken(shop, accessToken, locationsList, publicationChannel);

        //.log(isSaved);


        console.log(`Access token for ${shop}: ${accessToken}`);
        res.send("App installed successfully!");
    };


    // supplierSetting = async (req: Request, res: Response) => {
    //     const { error } = userValidator.supplierSetting(req.body);
    //     if (error) return res.status(404).send(error.message);
    //     const userId = req.user._id;
    //     const response = await user.saveSupplierSetting(req.body, userId);
    //     const statusCode = response?.status || 500;
    //     res.status(statusCode).send(response);
    // }

    // merchantSetting = async (req: Request, res: Response) => {
    //     const { error } = userValidator.supplierSetting(req.body);
    //     if (error) return res.status(404).send(error.message);
    //     const userId = req.user._id;
    //     const response = await user.saveMerchantSetting(req.body, userId);
    //     const statusCode = response?.status || 500;
    //     res.status(statusCode).send(response);
    // }

    getMerchantCredentials = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const response = await user.getMerchantCredentials(userId);
        res.status(response.status).send(response);
    }

    saveShopDetails = async (req: Request, res: Response) => {

        const { error } = userValidator.validateShopDetails(req.body);
        if (error) return res.status(400).send({ success: false, message: error.message });

        const accessToken = req.body.access_token;
        const shop_name = req.body.shop_name;
        const shopifyApi = new ShopifyApi(shop_name, accessToken).getShopifyObj();
        await shopifyApi.shop.get()
        const locations = await shopifyApi.location.list();
        const locationsList = locations.map((location, index) => { return { id: location.id, name: location.name, admin_graphql_api_id: location.admin_graphql_api_id, active: location.active, selected: (index == 0) ? true : false } });
        const response = await shopifyApi.webhook.create({
            topic: 'orders/create',
            address: `${process.env.ORDER_WEBHOOK_API_ENDPOINT}`,
            format: 'json',
        });

        console.log(response);
        const getSalesChannelQuery = `
                query publications {
                    publications(first: 5) {
                      edges {
                        node {
                          id
                          name
                          supportsFuturePublishing
                        }
                      }
                    }
                  }
                 `;

        const salesChannelResponse = await shopifyApi.graphql(getSalesChannelQuery);
        const publicationChannel = salesChannelResponse.publications; //.edges.find((edge: { [key: string]: any }) => edge.node.name == "Online Store");

        const isSaved = await user.saveAccessToken(shop_name, accessToken, locationsList, publicationChannel, req.user._id);
        const userResponse = await user.info(req.user._id);
        if (isSaved) {
            return res.status(200).send({ success: true, message: "connected to the shopify" });
        }
    }

    getUserDetails = async (req: Request, res: Response) => {
        const { _id, role } = req.user;
        let response: { [key: string]: any } = {};
        let productData: object;
        let orderData: object;
        // orderData = {
        //     total: 1000,
        //     fulfilled: 450,
        //     unfulfilled: 550
        // };

        let merchantData: object;
        merchantData = await user.getMerchantCount();
        let data: { [key: string]: any } = {};
        data.products = {
            "total": 22664,
            "uploaded": 13648,
            "not_uploaded": 9674
        };
        data.orders = {
            "fulfilled": 0,
            "unfulfilled": 4,
            "total": 4
        };
        response.status = 200;
        response.success = true;
        response.data = data;
        response.user_id = _id;
        response.role = role;
        const statusCode = response?.status || 500;
        delete response["status"];
        res.status(statusCode).send(response);
    }

}