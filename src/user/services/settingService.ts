import { Request, Response } from "express";
import { Setting } from "../database/controllers/setting";
import { SettingValidator } from "../../core/validator/user/settingValidator";
import redisClient from "../../core/redis";
import { ShopifyApi } from "../../core/shopify/shopify";

const setting = new Setting();
const settingValidator = new SettingValidator();

export class SettingsService {

    getLocation = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const response = await setting.getLocation(userId);
        return res.status(response.status).send(response);
    }

    updateLocation = async (req: Request, res: Response) => {

        const { error } = settingValidator.validateLocations(req.body);
        if (error) return res.status(400).send(error.message);
        const userId = req.user._id;
        const payload: { location_id: number } = req.body;
        const response = await setting.updateLocation(userId as string, payload);
        return res.status(response.status).send(response);

    }

    getPriceSetting = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const response = await setting.getPriceSettings(userId);
        console.log(response);
        return res.status(response.status).send(response);
    }

    savePriceSetting = async (req: Request, res: Response) => {
        const { error } = settingValidator.savePriceSetting(req.body);
        if (error) return res.status(400).send(error.message);
        const userId = req.user._id;
        const response = await setting.savePriceSetting(req.body, userId);
        return res.status(response.status).send(response);
    }

    getCurrencyValue = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const response = await setting.getCurrency(userId);
        console.log(response);
        return res.status(response.status).send(response);

    }
    currencySetting = async (req: Request, res: Response) => {
        const { error } = settingValidator.currencySetting(req.body);
        if (error) return res.status(400).send(error.message);
        const userId = req.user._id;
        const response = await setting.saveCurrencySetting(req.body, userId);
        return res.status(response.status).send(response);
    }

    getuploadOriginalPriceSetting = async (req: Request, res: Response) => {
        const userId: string = req.user._id;
        const response = await setting.getUploadOriginalSetting(userId);
        return res.status(response.status).send(response);
    }

    uploadOriginalPriceSetting = async (req: Request, res: Response) => {
        const { error } = settingValidator.uploadoriginalPrice(req.body);
        if (error) return res.status(400).send(error.message);
        const userId = req.user._id;
        const response = await setting.saveUploadPriceSetting(req.body, userId);
        return res.status(response.status).send(response);
    }

    getSyncingSetting = async (req: Request, res: Response) => {
        const userId: string = req.user._id;
        const response = await setting.getSyncingSetting(userId);
        return res.status(response.status).send(response);

    }

    getBrands = async (req: Request, res: Response) => {

        const userId = req.user._id;
        const brandsData = await redisClient.get(`brands_${userId}`);
        console.log(brandsData);
        if (brandsData) {
            const brands = (brandsData) ? JSON.parse(brandsData).brands : [];
            return res.status(200).send({ brands: brands, success: true });
        } else {
            return res.status(200).send({ brands: [], success: true });
        }
    }

    saveBrands = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const brandsData = await redisClient.get(`brand_${userId}`);
        const brands = req.body.brands;
        const result = await redisClient.set(`brands_${userId}`, JSON.stringify({ brands: brands }));
        console.log(result);
        if (result) {
            return res.status(200).send({ success: true, message: "Brands save sucessfully" });
        }
    }


    syncingSetting = async (req: Request, res: Response) => {
        const { error } = settingValidator.syncingSetting(req.body);
        if (error) return res.status(400).send(error.message);
        const userId = req.user._id;
        const response = await setting.saveSyncingSetting(req.body, userId);
        return res.status(response.status).send(response);
    }


    syncLocations = async (req: Request, res: Response) => {
        const userId = req.user._id;
        const locations = await setting.getLocations(userId);
        res.status(200).send({ locations: Object.keys(locations) });
    }

    addShopifyLocation = async (req: Request, res: Response) => {

        const userId = req.user._id;
        const warehouseInfo: { [key: string]: any } = {
            DS: { name: 'Delaware Warehouses', address: { address1: '', city: 'Delaware City', provinceCode: 'DE', countryCode: 'US', zip: '19706' } },
            NJ: { name: 'New Jersey Warehouses', address: { address1: '', city: 'Newark', provinceCode: 'NJ', countryCode: 'US', zip: '07102' } },
            TX: { name: 'Texas Warehouses', address: { address1: '', city: 'Houston', provinceCode: 'TX', countryCode: 'US', zip: '77001' } },
            NV: { name: 'Nevada Warehouses', address: { address1: '', city: 'Las Vegas', provinceCode: 'NV', countryCode: 'US', zip: '89101' } },
            KS: { name: 'Kansas Warehouses', address: { address1: '', city: 'Wichita', provinceCode: 'KS', countryCode: 'US', zip: '67201' } },
            OH: { name: 'Ohio Warehouses', address: { address1: '', city: 'Columbus', provinceCode: 'OH', countryCode: 'US', zip: '43201' } },
            GA: { name: 'Georgia Warehouses', address: { address1: '', city: 'Atlanta', provinceCode: 'GA', countryCode: 'US', zip: '30301' } },
            IL: { name: 'Illinois Warehouses', address: { address1: '', city: 'Chicago', provinceCode: 'IL', countryCode: 'US', zip: '60601' } },
            FL: { name: 'Florida Warehouses', address: { address1: '', city: 'Miami', provinceCode: 'FL', countryCode: 'US', zip: '33101' } }
        };
        const locationDetails = await setting.getLocations(userId);
        const shopify = new ShopifyApi(`${process.env.SHOPIFY_STORE_URL}`, `${process.env.SHOPIFY_ACCESS_TOKEN}`).getShopifyObj();
        const locationQuery = { input: warehouseInfo[`${req.body.location}`] };
        console.log(locationQuery);

        const locationAddMuatataion = ` mutation locationAdd($input: LocationAddInput!) {
            locationAdd(input: $input) {
              location {
                id
                name
                address {
                  address1
                  provinceCode
                  countryCode
                  zip
                }
                fulfillsOnlineOrders
              }
              userErrors {
                field
                message
              }
            }
          }              
        `;
        let locations: { [key: string]: any } = {};
        locations = { ...locationDetails };
        if (Object.keys(locations).includes(`${req.body.location}`)) {
            return res.send({ success: true, message: "location already exist !" });
        }
        const locationAddResponse = await shopify.graphql(locationAddMuatataion, locationQuery);
        if (locationAddResponse.locationAdd.location) {
            locations[`${req.body.location}`] = locationAddResponse.locationAdd.location;
        }

        const isUpdated = await setting.updateLocations(userId, locations);
        if (isUpdated) {
            return res.send({ success: true, message: "location added successfully" });
        }

        res.send({ success: false, message: "unable to create locations" });

    }

}