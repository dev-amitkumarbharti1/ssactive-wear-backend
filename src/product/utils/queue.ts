import { SqsService } from "../../core/aws-client/sqsService";
const sqs = new SqsService();
export const sendMessageToQueue = async (queueName: string, batch: Array<{}>) => {
    try {
        const entries = batch.map((message, index) => ({
            Id: `message${index}`,
            MessageBody: JSON.stringify(message),
        }));
        const response = await sqs.sendMessageBatch(queueName, entries);
        console.log(response);
        return response;

    } catch (e) {
        console.log(e);
    }
};