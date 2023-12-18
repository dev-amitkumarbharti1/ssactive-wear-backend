import { PrepareOrder } from "../utils/PrepareOrder";
import { OrderApi } from "../../core/ssactiveware-sdk/orderApi";
import { OrderController } from "../database/controllers/orderController";
interface IObject {
    [key: string]: any;
}
export class SqsOrderProcessor extends OrderController {

    data: IObject;
    constructor(message: IObject) {
        super();
        this.data = message;
    }

    createOrder = async () => {
        try {
            //             const data = `
            // {"version":"0","id":"710c3e05-322d-c8d5-5a8e-7eb1864e2858","detail-type":"shopifyWebhook","source":"aws.partner/shopify.com/74945331201/orderWebhook","account":"835636647687","time":"2023-12-08T11:48:55Z","region":"us-east-2","resources":[],"detail":{"payload":{"id":5198035779768,"admin_graphql_api_id":"gid://shopify/Order/5198035779768","app_id":580111,"browser_ip":"103.97.184.106","buyer_accepts_marketing":true,"cancel_reason":null,"cancelled_at":null,"cart_token":"c1-1df38e7122d8099347c4a75df7692b55","checkout_id":34927443378360,"checkout_token":"c38d01e43d20afb2f77fe967cb99e95e","client_details":{"accept_language":"en-IN","browser_height":null,"browser_ip":"103.97.184.106","browser_width":null,"session_hash":null,"user_agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"},"closed_at":null,"company":null,"confirmation_number":"AL6Q9FLVA","confirmed":true,"contact_email":"brooshbanner47@gmail.com","created_at":"2023-12-08T17:18:52+05:30","currency":"INR","current_subtotal_price":"31.86","current_subtotal_price_set":{"shop_money":{"amount":"31.86","currency_code":"INR"},"presentment_money":{"amount":"31.86","currency_code":"INR"}},"current_total_additional_fees_set":null,"current_total_discounts":"0.00","current_total_discounts_set":{"shop_money":{"amount":"0.00","currency_code":"INR"},"presentment_money":{"amount":"0.00","currency_code":"INR"}},"current_total_duties_set":null,"current_total_price":"1531.86","current_total_price_set":{"shop_money":{"amount":"1531.86","currency_code":"INR"},"presentment_money":{"amount":"1531.86","currency_code":"INR"}},"current_total_tax":"0.00","current_total_tax_set":{"shop_money":{"amount":"0.00","currency_code":"INR"},"presentment_money":{"amount":"0.00","currency_code":"INR"}},"customer_locale":"en-IN","device_id":null,"discount_codes":[],"email":"brooshbanner47@gmail.com","estimated_taxes":false,"financial_status":"paid","fulfillment_status":null,"landing_site":"/","landing_site_ref":null,"location_id":null,"merchant_of_record_app_id":null,"name":"#1067","note":null,"note_attributes":[],"number":67,"order_number":1067,"order_status_url":"https://store475.myshopify.com/55385522360/orders/149e306f39675aa1a02e8c1d7f117f47/authenticate?key=0384832732a558f03dbcb14fc06e3a19","original_total_additional_fees_set":null,"original_total_duties_set":null,"payment_gateway_names":["bogus"],"phone":null,"po_number":null,"presentment_currency":"INR","processed_at":"2023-12-08T17:18:51+05:30","reference":"debbbee890b7e3f8a2bc5eb0e56157ab","referring_site":"","source_identifier":"debbbee890b7e3f8a2bc5eb0e56157ab","source_name":"web","source_url":null,"subtotal_price":"31.86","subtotal_price_set":{"shop_money":{"amount":"31.86","currency_code":"INR"},"presentment_money":{"amount":"31.86","currency_code":"INR"}},"tags":"","tax_exempt":false,"tax_lines":[],"taxes_included":false,"test":true,"token":"149e306f39675aa1a02e8c1d7f117f47","total_discounts":"0.00","total_discounts_set":{"shop_money":{"amount":"0.00","currency_code":"INR"},"presentment_money":{"amount":"0.00","currency_code":"INR"}},"total_line_items_price":"31.86","total_line_items_price_set":{"shop_money":{"amount":"31.86","currency_code":"INR"},"presentment_money":{"amount":"31.86","currency_code":"INR"}},"total_outstanding":"0.00","total_price":"1531.86","total_price_set":{"shop_money":{"amount":"1531.86","currency_code":"INR"},"presentment_money":{"amount":"1531.86","currency_code":"INR"}},"total_shipping_price_set":{"shop_money":{"amount":"1500.00","currency_code":"INR"},"presentment_money":{"amount":"1500.00","currency_code":"INR"}},"total_tax":"0.00","total_tax_set":{"shop_money":{"amount":"0.00","currency_code":"INR"},"presentment_money":{"amount":"0.00","currency_code":"INR"}},"total_tip_received":"0.00","total_weight":0,"updated_at":"2023-12-08T17:18:54+05:30","user_id":null,"billing_address":{"first_name":"bvhnj","address1":"1365 Clifton Road","phone":null,"city":"Atlanta","zip":"30322","province":"Georgia","country":"United States","last_name":"kjkj","address2":null,"company":null,"latitude":null,"longitude":null,"name":"bvhnj kjkj","country_code":"US","province_code":"GA"},"customer":{"id":5977028657336,"email":"brooshbanner47@gmail.com","accepts_marketing":true,"created_at":"2022-06-09T18:21:53+05:30","updated_at":"2023-12-08T17:18:53+05:30","first_name":"gfkjk","last_name":"hj","state":"enabled","note":null,"verified_email":false,"multipass_identifier":null,"tax_exempt":false,"phone":null,"email_marketing_consent":{"state":"subscribed","opt_in_level":"single_opt_in","consent_updated_at":"2022-06-29T13:44:07+05:30"},"sms_marketing_consent":null,"tags":"newsletter","currency":"INR","accepts_marketing_updated_at":"2022-06-29T13:44:07+05:30","marketing_opt_in_level":"single_opt_in","tax_exemptions":[],"admin_graphql_api_id":"gid://shopify/Customer/5977028657336","default_address":{"id":8597388624056,"customer_id":5977028657336,"first_name":"bvhnj","last_name":"kjkj","company":null,"address1":"1365 Clifton Road","address2":"","city":"Atlanta","province":"Georgia","country":"United States","zip":"30322","phone":"","name":"bvhnj kjkj","province_code":"GA","country_code":"US","country_name":"United States","default":true}},"discount_applications":[],"fulfillments":[],"line_items":[{"id":12479692538040,"admin_graphql_api_id":"gid://shopify/LineItem/12479692538040","fulfillable_quantity":1,"fulfillment_service":"manual","fulfillment_status":null,"gift_card":false,"grams":0,"name":"Camo Polo - Green Oxide / S","price":"31.86","price_set":{"shop_money":{"amount":"31.86","currency_code":"INR"},"presentment_money":{"amount":"31.86","currency_code":"INR"}},"product_exists":true,"product_id":7379857277112,"properties":[],"quantity":1,"requires_shipping":true,"sku":"B06953173","taxable":true,"title":"Camo Polo","total_discount":"0.00","total_discount_set":{"shop_money":{"amount":"0.00","currency_code":"INR"},"presentment_money":{"amount":"0.00","currency_code":"INR"}},"variant_id":42642365448376,"variant_inventory_management":"shopify","variant_title":"Green Oxide / S","vendor":"Adidas","tax_lines":[],"duties":[],"discount_allocations":[]}],"payment_terms":null,"refunds":[],"shipping_address":{"first_name":"bvhnj","address1":"1365 Clifton Road","phone":null,"city":"Atlanta","zip":"30322","province":"Georgia","country":"United States","last_name":"kjkj","address2":null,"company":null,"latitude":33.7917228,"longitude":-84.3204102,"name":"bvhnj kjkj","country_code":"US","province_code":"GA"},"shipping_lines":[{"id":4224516587704,"carrier_identifier":"650f1a14fa979ec5c74d063e968411d4","code":"Standard","discounted_price":"1500.00","discounted_price_set":{"shop_money":{"amount":"1500.00","currency_code":"INR"},"presentment_money":{"amount":"1500.00","currency_code":"INR"}},"phone":null,"price":"1500.00","price_set":{"shop_money":{"amount":"1500.00","currency_code":"INR"},"presentment_money":{"amount":"1500.00","currency_code":"INR"}},"requested_fulfillment_service_id":null,"source":"shopify","title":"Standard","tax_lines":[],"discount_allocations":[]}]},"metadata":{"Content-Type":"application/json","X-Shopify-Topic":"orders/updated","X-Shopify-Shop-Domain":"store475.myshopify.com","X-Shopify-Order-Id":"5198035779768","X-Shopify-Test":"true","X-Shopify-Hmac-SHA256":"JY0MlrLzBLGWGhm1lmmmEgPFTfBcPgVMzIlOjdgmAKY=","X-Shopify-Webhook-Id":"85420aff-251f-45d2-a025-c18d7fa5d87f","X-Shopify-API-Version":"2023-10","X-Shopify-Triggered-At":"2023-12-08T11:48:53.257929387Z"}}}
            //             `;
            const orderDetails = this.data;
            const orderPayload = orderDetails.detail.payload;
            //  const metadata = orderDetails.detail.metadata;
            const merchantId = "6543a5c45c5e1d619c5a0ceb";
            const orderId = orderPayload.id;
            const addResult = await this.addOrder(merchantId, orderPayload);

            if (addResult.isCreated === true) {
                const supplierOrderFormate = PrepareOrder.getSupplierFormate(orderPayload);
                const orderResponse = await new OrderApi().createOrder(supplierOrderFormate);
                const supplierData = orderResponse.data;
                const isCreated = await this.updateSupplierData(merchantId, orderId, supplierData);
                return isCreated;
            } else if (addResult.isUpdated === true) {
                console.log("order already exists");
                return true;
            }
            return false;
        } catch (err) {
            console.log("error", err);
        }
    }



    cencelOrder = () => {

    }
}