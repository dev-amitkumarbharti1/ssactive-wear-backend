import express, { Router } from "express";
import { UserService } from "../services/userService";
import { SettingsService } from "../services/settingService";
import { asyncErrorHandler } from "../../core/middleware/errorHandler";
import { isAuth } from "../../core/middleware/auth";
import { roleAuthorization } from "../../core/middleware/roleAuthorization";

const userService = new UserService();
const settingService = new SettingsService();
const ROUTER = express.Router();

ROUTER.post("/api/user/register", asyncErrorHandler(userService.register));
ROUTER.put("/api/user/verify-account", asyncErrorHandler(userService.verifyAccount));
ROUTER.post("/api/user/login", asyncErrorHandler(userService.login));
ROUTER.post("/api/user/logout", roleAuthorization, asyncErrorHandler(userService.logout));
ROUTER.post("/api/user/reset-password", asyncErrorHandler(userService.resetPassword));
ROUTER.put("/api/user/change-password", asyncErrorHandler(userService.changePassword));
ROUTER.post("/api/user/resend-mail", asyncErrorHandler(userService.reSendOtp));
ROUTER.put("/api/user/onboard", isAuth, asyncErrorHandler(userService.onBoard));
ROUTER.get("/api/user/info", isAuth, asyncErrorHandler(userService.getInfo));

ROUTER.get("/api/user/install/callback", asyncErrorHandler(userService.callBack));

ROUTER.post("/api/user/install", isAuth, asyncErrorHandler(userService.installApp));
ROUTER.put("/api/user/shop-details", isAuth, asyncErrorHandler(userService.saveShopDetails));


ROUTER.get("/api/user/settings", isAuth, roleAuthorization, asyncErrorHandler(userService.settings));

// ROUTER.put("/api/user/supplier/setting", isAuth, roleAuthorization, asyncErrorHandler(userService.supplierSetting));
ROUTER.get("/api/user/supplier/setting", isAuth, roleAuthorization, asyncErrorHandler(userService.getMerchantCredentials));

ROUTER.get("/api/user/shopify/locations", isAuth, roleAuthorization, asyncErrorHandler(settingService.getLocation));
ROUTER.put("/api/user/shopify/locations", isAuth, roleAuthorization, asyncErrorHandler(settingService.updateLocation));

ROUTER.get("/api/user/settings/price", isAuth, roleAuthorization, asyncErrorHandler(settingService.getPriceSetting));
ROUTER.put("/api/user/settings/price", isAuth, roleAuthorization, asyncErrorHandler(settingService.savePriceSetting));

ROUTER.get("/api/user/settings/currency", isAuth, roleAuthorization, asyncErrorHandler(settingService.getCurrencyValue));
ROUTER.put("/api/user/settings/currency", isAuth, roleAuthorization, asyncErrorHandler(settingService.currencySetting));

// ROUTER.put("/api/user/merchant/setting", isAuth, roleAuthorization, asyncErrorHandler(userService.merchantSetting));
ROUTER.get("/api/user/merchant/setting", isAuth, roleAuthorization, asyncErrorHandler(userService.getMerchantCredentials));

ROUTER.get("/api/user/settings/syncing", isAuth, roleAuthorization, asyncErrorHandler(settingService.getSyncingSetting));
ROUTER.put("/api/user/settings/syncing", isAuth, roleAuthorization, asyncErrorHandler(settingService.syncingSetting));

ROUTER.get("/api/user/settings/brands", isAuth, roleAuthorization, asyncErrorHandler(settingService.getBrands));
ROUTER.put("/api/user/settings/brands", isAuth, roleAuthorization, asyncErrorHandler(settingService.saveBrands));

ROUTER.post("/api/location/warehouse/add", isAuth, asyncErrorHandler(settingService.addShopifyLocation));
ROUTER.get("/api/sync/locations", isAuth, asyncErrorHandler(settingService.syncLocations));

//ROUTER.get("/api/user/addInList", isAuth, roleAuthorization, asyncErrorHandler(settingService.addInCreateList));

ROUTER.get("/api/user/settings/upload-original-price", isAuth, roleAuthorization, asyncErrorHandler(settingService.getuploadOriginalPriceSetting));
ROUTER.put("/api/user/settings/upload-original-price", isAuth, roleAuthorization, asyncErrorHandler(settingService.uploadOriginalPriceSetting));

ROUTER.get("/api/user/details", isAuth, asyncErrorHandler(userService.getUserDetails));


export default ROUTER;
