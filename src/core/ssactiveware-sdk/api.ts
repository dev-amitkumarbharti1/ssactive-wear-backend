import config from "../config";

export class Api {
    baseUrl: string;
    categoryApi: string;
    productApi: string;
    styleApi: string;
    inventoryApi: string;
    orderApi: string;
    trackingApi: string;
    constructor() {
        this.baseUrl = "https://api.ssactivewear.com";
        this.categoryApi = `${this.baseUrl}/v2/categories/`;
        this.styleApi = `${this.baseUrl}/v2/styles/`;
        this.productApi = `${this.baseUrl}/v2/products/`;
        this.inventoryApi = `${this.baseUrl}/v2/inventory/`;
        this.orderApi = `${this.baseUrl}/v2/orders/`;
        this.trackingApi = `${this.baseUrl}/v2/TrackingDataByOrderNum/`;
    }

    getAuthorizationHeaders = () => {
        const base64Credentials = Buffer.from(`${config.USERNAME}:${config.API_PASSWORD}`).toString('base64');
        return {
            'Authorization': `Basic ${base64Credentials}`,
            'Content-Type': 'application/json'
        };
    }

}