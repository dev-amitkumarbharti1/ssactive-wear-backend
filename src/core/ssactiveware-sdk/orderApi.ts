import { Api } from "./api";
import axios from "axios";
interface IObject { [key: string]: any };
export class OrderApi extends Api {
    constructor() {
        super();
    }

    createOrder = async (orderData: IObject) => {
        try {
            const headers = this.getAuthorizationHeaders();
            console.log(orderData);
            const config = { headers }
            const response = await axios.post(`${this.orderApi}`, { ...orderData }, config);
            return response;
        } catch (err: any) {
            if (err.response.data.code === '400') {
                return { success: false, data: JSON.stringify(err.response.data.errors) };
            }
            return { success: false, data: JSON.stringify(err) };
        }
    }


    getTracking = async (orderId: string) => {
        const headers = this.getAuthorizationHeaders();
        const config = { headers }
        const response = await axios.get(`${this.trackingApi}${orderId}`, config);
        return response;
    }

}