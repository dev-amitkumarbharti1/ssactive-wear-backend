import Shopify from "shopify-api-node";

export class ShopifyApi {
    shop_name: string;
    access_token: string;
    constructor(shop_name: string, access_token: string) {
        this.shop_name = shop_name;
        this.access_token = access_token;
    }

    getShopifyObj = () => {
        const shopify = new Shopify({
            shopName: this.shop_name,
            accessToken: this.access_token,
            apiVersion: '2023-04',
            autoLimit: { calls: 1, interval: 1000, bucketSize: 35 }
        });
        return shopify;
    }

}