import { Api } from "./api";
import axios from "axios";

export class ProductApi extends Api {

    constructor() {
        super();
    }

    getProducts = async () => {
        const headers = this.getAuthorizationHeaders();
        const config = { headers }
        const response = await axios.get(`${this.styleApi}`, config);
        return response;
    }


    getVariants = async () => {
        const headers = this.getAuthorizationHeaders();
        const config = { headers }
        const response = await axios.get(`${this.productApi}`, config);
        return response;
    }


    getInventory = async (styleID: number) => {
        const headers = this.getAuthorizationHeaders();
        const config = { headers }
        const response = await axios.get(`${this.inventoryApi}?styleid=${styleID}`, config);
        return response;

    }

    getVariantList = async (params: string) => {
        const headers = this.getAuthorizationHeaders();
        const config = { headers }
        const response = await axios.get(`${this.productApi}/${params}`, config);
        return response;
    }
}