import { userModel } from "../models/user";
import { priceSetting } from "../../../core/validator/user/settingValidator";

export class Setting {

    getLocation = async (userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.shop_details && user.shop_details.locations) {
                return { success: true, status: 200, locations: user.shop_details.locations }
            }
            return { success: false, status: 404, data: JSON.stringify(user.shop_details), message: "Location not found" };
        }
        return { success: false, status: 404, message: "No user found" };
    }

    updateLocation = async (userId: string, data: { location_id: number }) => {

        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.shop_details) {
                const locations = user.shop_details.locations.map((loc: { [key: string]: any }) => {
                    if (loc.id == data.location_id) {
                        loc.selected = true;
                    } else {
                        loc.selected = false;
                    }
                    return loc;
                });
                await userModel.updateOne({ _id: userId }, { 'shop_details.locations': locations });
                return { success: true, status: 200, message: 'location updated successfully' };
            }

        }
        // await userModel.updateOne({ _id: userId }, { $set: { 'shop_details.locations': data.locations } });
        return { success: true, status: 200, message: 'location updated successfully' };
    }

    getPriceSettings = async (userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.global_settings && user.global_settings.price) {
                return { success: true, status: 200, price: user.global_settings.price }
            }
            return { success: true, status: 200, price: { custom_price: false, settings: { type: "increase", value: 0, value_type: "flat" } }, message: "price setting not found" };
        }
        return { success: false, status: 404, message: "No user found" };

    }

    savePriceSetting = async (setting: priceSetting, userId: string) => {
        await userModel.updateOne({ _id: userId }, { $set: { 'global_settings.price': setting } });
        return { status: 200, success: true, message: "price setting update successfully" };
    }


    getCurrency = async (userId: string) => {

        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.global_settings && user.global_settings.currency) {
                return { success: true, status: 200, currency: user.global_settings.currency }
            }
            return { success: true, status: 200, currency: { enable: false, value: 0 }, message: "currency setting" };
        }
        return { success: false, status: 404, message: "No user found" };

    }

    saveCurrencySetting = async (setting: { enable: boolean, value: number }, userId: string) => {
        await userModel.updateOne({ _id: userId }, { $set: { 'global_settings.currency': setting } });
        return { status: 200, success: true, message: "setting update successfully" };
    }


    getUploadOriginalSetting = async (userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.global_settings && user.global_settings.upload_original_price) {
                return { success: true, status: 200, upload_original_price: user.global_settings.upload_original_price }
            }
            return { success: true, status: 200, upload_original_price: false, message: "upload_original_price setting not found" };
        }
        return { success: false, status: 404, message: "No user found" };

    }

    saveUploadPriceSetting = async (setting: { upload_original_price: boolean }, userId: string) => {
        await userModel.updateOne({ _id: userId }, { $set: { 'global_settings.upload_original_price': setting.upload_original_price } });
        return { status: 200, success: true, message: "setting update successfully" };
    }

    saveSyncingSetting = async (syncingSetting: { enable: boolean, settings: { title: boolean, description: boolean, price: boolean, tags: boolean } }, userId: string) => {
        await userModel.updateOne({ _id: userId }, { $set: { 'global_settings.syncing_setting': syncingSetting } });
        return { status: 200, success: true, message: "setting update successfully" };
    }

    getSyncingSetting = async (userId: string) => {

        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.global_settings && user.global_settings.syncing_setting) {
                return { success: true, status: 200, syncing_setting: user.global_settings.syncing_setting }
            }
            return { success: true, status: 200, syncing_setting: { enable: true, settings: { title: true, description: true, price: true, tags: true } }, message: "syncing_setting setting not found" };
        }
        return { success: false, status: 404, message: "No user found" };

    }


    getLocations = async (merchantId: string) => {
        const user = await userModel.findOne({ _id: merchantId });
        return (user?.locations) ? user.locations : {};

    }

    updateLocations = async (merchantId: string, locations: { [key: string]: any }) => {
        const user = await userModel.findOne({ _id: merchantId });
        if (user) {
            user.locations = locations;
            user.save();
            return true;
        }
        return false;
    }

}