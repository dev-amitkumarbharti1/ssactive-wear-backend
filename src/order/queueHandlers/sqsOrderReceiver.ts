import { SqsService } from "../../core/aws-client/sqsService";
const pollingInterval = 5000;
import { SqsOrderProcessor } from "./sqsOrderProcessor";

export const getOrder = async () => {
    try {
        const sqs = new SqsService();
        const data = await sqs.recieveMessage('orderQueue', 1, 2);
        data?.forEach(async (item) => {
            let bodyResponse: string | undefined = item.Body;
            if (bodyResponse) {
                let message = JSON.parse(bodyResponse);
                const result = await new SqsOrderProcessor(message).createOrder();
                if (result) {
                    const deleteResult = await sqs.deleteMessage('orderQueue', item?.ReceiptHandle);
                    console.log(deleteResult);
                }
            }
        })

    } catch (error) {
        console.error('Error receiving message from SQS:', error);
    } finally {
        setTimeout(getOrder, pollingInterval);
    }
}