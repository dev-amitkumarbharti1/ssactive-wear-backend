import { userModel, Role, onBoarded } from "../models/user";
import bcrypt from "bcrypt";
import { sendMail } from "../../../core/mailer";
import config from "../../../core/config";
import crypto from "crypto";
import { EmailTemplate } from "../../../core/emailTemplate";
import redisClient from "../../../core/redis";
import { supplierSettingPayload } from "../../../core/validator/user/userValidator";
// import { Api } from "../../../core/elixir-sdk/api";

interface registerPayload {
    username: string;
    email: string;
    status: string;
    password: string;
    password_hash: string;
    onboarded: boolean;
    email_activation_otp: number;
    email_activation_timestamp: Date;
    email_activation_token: string;
}


interface ShopifyConfig {
    shop_name: string;
    access_token: string;
}

export interface otpPayload {
    otp: number;
    token: string;
}

interface MessgaeResponse {
    message?: string;
    success?: boolean;
    status?: number;
    data?: object;
    token?: string;
}

export interface onBoardPayload {
    role: Role;
    ecommerce_plateform: string;
    onboarded: boolean;
    shop_details?: object;
    supplier_id?: string;
    info?: object;
}

enum Status {
    Inactive = "inactive",
    Active = "active",
}

interface loginPayload {
    email: string;
    password: string;
}

export interface tokenPayload {
    token: string
}

const emailTemplate = new EmailTemplate();

export class User {
    registerUser = async (data: registerPayload) => {
        const response: MessgaeResponse = {};
        const { email, password } = data;
        const password_hash = await bcrypt.hash(password, config.PASSWORD_SALT);
        data.password_hash = password_hash;
        const opt = Math.floor(100000 + Math.random() * 900000);
        data.email_activation_otp = opt;
        data.email = email.toLowerCase();
        data.email_activation_timestamp = new Date(Date.now() + 15 * 60 * 1000);
        data.email_activation_token = crypto.randomBytes(12).toString("hex");
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            const isSend = await sendMail(email, "Verify Email", emailTemplate.otpSend(data.username, opt));
            if (isSend) {
                await userModel.create(data);
                response.message = "user created";
                response.success = true;
                response.status = 201;
                response.token = data.email_activation_token;
            } else {
                response.status = 409;
                response.message = "Failed to send opt";
                response.success = isSend;
            }
        } else {
            response.status = 422;
            response.message = "user already exists";
            response.success = false;
        }
        return response;
    };

    userLogin = async (data: loginPayload) => {
        const response: MessgaeResponse = {};
        const { email, password } = data;
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (user) {
            const isTrue = await bcrypt.compare(password, user.password_hash);
            if (isTrue) {
                const jwtToken = user.getJwtToken();
                if (user.status !== Status.Active) {
                    await userModel.deleteOne({ email: email.toLowerCase() });
                    return { status: 404, message: "User not found", success: false };
                }
                response.data = {
                    token: jwtToken,
                    message: "user logged in successfully",
                    role: user.role,
                    type: "Bearer",
                    onboarded: user.onboarded,
                    username: user.username,
                    email: user.email,
                    is_verified_by_admin: user.is_verified_by_admin,
                    is_verified_by_supplier: user.is_verified_by_supplier
                };
                console.log(user.is_verified_by_supplier, user.is_verified_by_admin);
                // if ((user.is_verified_by_supplier === true) && (user.is_verified_by_admin === true)) {
                //     await this.configOnLogin(user._id, user.supplier_api_credentials);
                // }
                response.message = "user logged in successfully";
                response.success = true;
                response.status = 200;
            } else {
                response.message = "Invalid password";
                response.success = false;
                response.status = 401;
            }
        } else {
            response.message = "User not found";
            response.success = false;
            response.status = 404;
        }
        return response;
    };

    resetPassword = async (email: string) => {
        const response: MessgaeResponse = {};
        const user = await userModel.findOne({ email: email });
        if (user) {
            const currentTimestamp = Date.now();
            const futureTimestamp = currentTimestamp + 5 * 60 * 1000;
            const password_reset_token = crypto.randomBytes(12).toString("hex");
            const password_reset_timestamp = new Date(futureTimestamp);
            user.password_reset_token = password_reset_token;
            user.password_reset_timestamp = password_reset_timestamp;
            user.save();
            await sendMail(email, "Reset Password", new EmailTemplate().resetPassword(password_reset_token));
            response.message = "Reset Password Email sent";
            response.success = true;
            response.status = 200;
            response.data = { password_reset_token: password_reset_token };
        } else {
            response.message = "User not found";
            response.success = false;
            response.status = 404;
        }
        return response;
    };

    changePassword = async (password_reset_token: string, newPassword: string) => {
        const response: MessgaeResponse = {};
        const user = await userModel.findOne({ password_reset_token: password_reset_token });

        if (user) {
            const { password_reset_timestamp } = user;
            const currentTimeStamp = new Date(Date.now());
            if (password_reset_timestamp !== undefined) {
                const resetTimeStamp = new Date(password_reset_timestamp);
                if (resetTimeStamp > currentTimeStamp) {
                    const password_hash = await bcrypt.hash(
                        newPassword,
                        config.PASSWORD_SALT
                    );
                    user.password_hash = password_hash;
                    user.password_reset_timestamp = undefined;
                    user.password_reset_token = undefined;
                    user.save();
                    response.message = "Password updated Successfully";
                    response.status = 200;
                    response.success = true;
                } else {
                    response.message = "Token expired";
                    response.status = 401;
                    response.success = false;
                }
            } else {
                response.message = "Token expired";
                response.status = 401;
                response.success = false;
            }
        } else {
            response.message = "Invalid token";
            response.status = 404;
            response.success = false;
        }
        return response;
    };

    getUserByEmail = async (email: string) => {
        const user = await userModel.findOne({ email: email });
        let isValid: boolean = user ? true : false;
        return isValid;
    };

    // configOnLogin = async (userId: string, data: any) => {

    //     const key = `elixir_token_${userId}`;
    //     const credentialsKey = `elixir_credentials_${userId}`;

    //     const response = await elixirApi.getToken(data);
    //     const next59MinutesTimestamp = Math.floor((Date.now() + 10 * 60 * 1000) / 1000);// Adding 59 minutes in milliseconds
    //     await redisClient.set(key, JSON.stringify({ token: response.data.data.token, tokenTimestamp: next59MinutesTimestamp }));
    //     await redisClient.set(credentialsKey, JSON.stringify(data));

    // }

    verifyOtp = async (data: otpPayload) => {
        const response: MessgaeResponse = {};
        const { token, otp } = data;
        const user = await userModel.findOne({ email_activation_token: token });
        if (user) {
            const { email_activation_otp, email_activation_timestamp } = user;
            const currentTimeStamp: Date = new Date(Date.now());

            if (email_activation_otp === +otp) {
                if (email_activation_timestamp && email_activation_timestamp > currentTimeStamp) {
                    user.email_activation_otp = undefined;
                    user.email_activation_timestamp = undefined;
                    user.email_activation_token = undefined;
                    user.status = Status.Active;
                    user.save();
                    response.message = "Acccount verified";
                    response.success = true;
                    response.status = 200;
                } else {
                    response.message = "Verification timed out resend otp";
                    response.success = false;
                    response.status = 408;
                }
            } else {
                response.message = "Invalid otp";
                response.success = false;
                response.status = 403;
            }
        } else {
            response.message = "No user records are found";
            response.success = false;
            response.status = 404;
        }
        return response;
    };

    sendOpt = async (data: tokenPayload) => {
        const response: MessgaeResponse = {};
        const email_activation_token = data.token;
        const user = await userModel.findOne({ email_activation_token: email_activation_token });
        if (user) {
            const opt = Math.floor(100000 + Math.random() * 900000);
            user.email_activation_otp = opt;
            user.email_activation_timestamp = new Date(Date.now() + 60 * 60 * 1000);
            user.save();
            const isSend = await sendMail(user.email, "Verify Email", emailTemplate.otpSend(user.username, opt));
            if (isSend) {
                response.status = 200;
                response.message = "otp sent";
                response.success = true;
            } else {
                response.status = 400;
                response.message = "invalid email address";
                response.success = false;
            }
        } else {
            response.status = 400;
            response.message = "Invalid token open";
            response.success = false;
        }

        return response;

    }

    submitOnborading = async (userData: onBoardPayload, userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user && !user.onboarded) {
            user.role = userData.role;
            user.onboarded = onBoarded.Yes;
            await user.save();
            return {
                status: 200,
                message: "User onboarding completed successfully.",
                success: true,
                user: userData.role,
                onboarded: user.onboarded,
                is_verified_by_supplier: user.is_verified_by_supplier,
                is_verified_by_admin: user.is_verified_by_admin,
                token: user.getJwtToken()
            };
        } else if (user && user.onboarded) {
            return { status: 409, message: "User is already onboarded.", success: false };
        } else {
            return { status: 404, message: "User not found.", success: false };
        }
    };

    info = async (userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            return { status: 200, message: "user data", success: true, data: { status: user.status, username: user.username, role: user.role, onboarded: user.onboarded } };
        } else {
            return { status: 404, message: "user not found", success: false };
        }
    }

    saveAccessToken = async (shop_name: any, access_token: string, locations: Array<object>, publicationChannel: any, userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            user.shop_details = { shop_name, access_token, locations, publicationChannel };
            user.save();
            return true
        } else {
            return false
        }
    }


    // saveSupplierSetting = async (data: supplierSettingPayload, userId: string) => {
    //     const key = `elixir_token_${userId}`;
    //     const credentialsKey = `elixir_credentials_${userId}`;
    //     const response = await elixirApi.getToken(data);
    //     const next59MinutesTimestamp = Math.floor((Date.now() + 10 * 60 * 1000) / 1000);// Adding 59 minutes in milliseconds
    //     if (response.data.custom_code == '00') {
    //         const user = await userModel.findOne({ _id: userId });
    //         if (user) {
    //             user.supplier_api_credentials = data;
    //             user.save();
    //             await redisClient.set(key, JSON.stringify({ token: response.data.data.token, tokenTimestamp: next59MinutesTimestamp }));
    //             await redisClient.set(credentialsKey, JSON.stringify(data));
    //             return { success: true, message: 'setting saved', status: 200 };
    //         } else {
    //             return { success: false, message: 'User not found', status: 404 };
    //         }
    //     } else {
    //         return { success: false, message: 'Invalid credentials', status: 401 };
    //     }
    // }

    getSetting = async (userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) return { success: true, message: "setting data", status: 200, data: user.global_settings };
        return { success: true, message: "no data found", status: 404, data: {} };
    }

    static getConfig = async (userId: string) => {
        const user = await userModel.findOne({ _id: userId });
        if (user) {
            return { shopify_details: user.shop_details, global_settings: user.global_settings };
        }
    }

    static getSupplierAndShopifyConfig = async (shopURL: string) => {
        const user = await userModel.findOne({ 'shop_details.shop_name': shopURL });
        if (user) {
            return { merchant_id: user._id, shopify_details: user.shop_details, supplier_details: user.supplier_api_credentials };
        }
        return false;
    }

    static getShopifySetting = async (userId: string): Promise<ShopifyConfig> => {
        const user = await userModel.findOne({ _id: userId }).select({ shop_details: 1 });
        return user?.shop_details as ShopifyConfig;
    }

    // saveMerchantSetting = async (data: supplierSettingPayload, userId: string) => {
    //     const key = `elixir_token_${userId}`;
    //     const credentialsKey = `elixir_credentials_${userId}`;
    //     const response = await elixirApi.getToken(data);
    //     const next59MinutesTimestamp = Math.floor((Date.now() + 10 * 60 * 1000) / 1000);
    //     if (response.data.custom_code == '00') {
    //         const user = await userModel.findOne({ _id: userId });
    //         if (user) {
    //             user.supplier_api_credentials = data;
    //             user.save();
    //             await redisClient.set(key, JSON.stringify({ token: response.data.data.token, tokenTimestamp: next59MinutesTimestamp }));
    //             await redisClient.set(credentialsKey, JSON.stringify(data));
    //             return { success: true, message: 'setting saved', status: 200 };
    //         } else {
    //             return { success: false, message: 'User not found', status: 404 };
    //         }
    //     } else {
    //         return { success: false, message: 'Invalid credentials', status: 401 };
    //     }
    // }

    getMerchantCredentials = async (userId: string) => {

        const user = await userModel.findOne({ _id: userId });
        if (user) {
            if (user.supplier_api_credentials) {
                return { success: true, status: 200, supplier_api_credentials: user.supplier_api_credentials }
            }
            return { success: true, status: 200, supplier_api_credentials: { username: "", identifier: "", key: "" }, message: "supplier api credentials setting not found" };
        }
        return { success: false, status: 404, message: "No user found" };

    }

    getMerchantCount = async () => {

        const verifyCountPromise = userModel.countDocuments({ is_verified_by_supplier: true, role: 'merchant' });
        const notVerifyCountPromise = userModel.countDocuments({ is_verified_by_supplier: false, role: 'merchant' });

        const [approvedCount, notApprovedCount] = await Promise.all([verifyCountPromise, notVerifyCountPromise]);
        return {
            approved: approvedCount,
            not_approved: notApprovedCount,
            total: approvedCount + notApprovedCount
        };

    }


}
