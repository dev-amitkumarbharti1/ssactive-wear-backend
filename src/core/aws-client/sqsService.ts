import { SQSClient, CreateQueueCommand, DeleteMessageCommand, ReceiveMessageCommand, SendMessageCommand, SendMessageBatchCommand, GetQueueAttributesCommand } from '@aws-sdk/client-sqs';


interface clientResponse {
    success?: boolean;
    message?: any;
    info?: any;
}

export class SqsService {

    private region;
    private accessKeyId;
    private secretAccessKey;

    constructor() {
        this.region = `${process.env.AWS_REGION}`;
        this.accessKeyId = `${process.env.AWS_ACCESS_ID}`;
        this.secretAccessKey = `${process.env.AWS_SECRET_KEY}`;

    }
    private _getClient = async () => {
        const sqsConfig = {
            region: this.region,
            credentials: {
                accessKeyId: this.accessKeyId,
                secretAccessKey: this.secretAccessKey
            }
        };

        const sqsClient = new SQSClient(sqsConfig);
        return sqsClient;
    }

    public sendMessage = async (QueueName: string, message: string): Promise<clientResponse> => {
        try {
            const command = new SendMessageCommand({
                QueueUrl: `${process.env.QUEUE_BASE_URL}/${QueueName}`,
                MessageBody: message,
            });
            const client = await this._getClient();
            const response = await client.send(command);
            if (response.$metadata.httpStatusCode === 200) {
                return { success: true, message: response };
            }
            return { success: false, message: response };
        } catch (error: any) {
            if (error.$metadata.httpStatusCode === 400) {
                const createResponse = await this.createQueue(QueueName, message);
                if (createResponse && createResponse.success === true) {
                    return { success: true, message: "queue created and inserted message", info: createResponse };
                }
                return { success: false, message: createResponse };
            }
            return { success: false, message: error.$metadata };

        }

    }

    public sendMessageBatch = async (QueueName: string, entries: Array<{ Id: string; MessageBody: string; DelaySeconds?: number }>): Promise<clientResponse> => {

        try {
            const command = new SendMessageBatchCommand({
                QueueUrl: `${process.env.QUEUE_BASE_URL}/${QueueName}`,
                Entries: entries,
            });
            const client = await this._getClient();
            const response = await client.send(command);
            if (response.$metadata.httpStatusCode === 200) {
                return { success: true, message: response };
            }
            return { success: false, message: response };
        } catch (error: any) {
            if (error.$metadata.httpStatusCode === 400) {
                const createResponse = await this.createQueue(QueueName, entries, true);
                if (createResponse && createResponse.success === true) {
                    return { success: true, message: "queue created and inserted message", info: createResponse };
                }
                return { success: false, message: createResponse };
            }
            return { success: false, message: error.$metadata };

        }

    }

    private createQueue = async (QueueName: string, message: any, batch: boolean = false) => {
        try {
            const command = new CreateQueueCommand({
                QueueName: QueueName,
                Attributes: {
                    DelaySeconds: "1",
                    VisibilityTimeout: "60"
                },
            });

            const client = await this._getClient();
            const response = await client.send(command);
            if (response && response.$metadata.httpStatusCode === 200) {
                let sendResult;
                if (batch == true) {
                    sendResult = await this.sendMessageBatch(QueueName, message);
                } else {
                    sendResult = await this.sendMessage(QueueName, message);
                }
                return { success: true, message: response.$metadata, info: sendResult };
            }
        } catch (error: any) {
            return { success: false, message: error };
        }

    }


    public recieveMessage = async (QueueName: string, messageCount: number = 1, waitTimeout: number = 10) => {
        try {

            const receiveMessageCommand = new ReceiveMessageCommand({
                QueueUrl: `${process.env.QUEUE_BASE_URL}/${QueueName}`,
                MaxNumberOfMessages: messageCount, // Number of messages to retrieve (adjust as needed)
                WaitTimeSeconds: waitTimeout, // Time to wait for messages (adjust as needed)
            });

            const client = await this._getClient();
            const response = await client.send(receiveMessageCommand);
            const messages = response.Messages;
            return messages;

        } catch (error) {
            console.log("Recieved queue", QueueName);
            console.error("Error retrieving message from SQS:", error);
            throw error;
        }
    }

    public deleteMessage = async (QueueName: string, receiptHandle: string | undefined) => {
        try {
            if (receiptHandle !== undefined) {
                const deleteMessageCommand = new DeleteMessageCommand({
                    QueueUrl: `${process.env.QUEUE_BASE_URL}/${QueueName}`,
                    ReceiptHandle: receiptHandle,
                });
                const client = await this._getClient();
                const deleteResponse = await client.send(deleteMessageCommand);
                return { success: true, message: deleteResponse };
            }
        } catch (e) {
            console.log(e);
        }
    }

    public getQueueMessageCount = async (QueueName: string) => {
        try {

            const queueUrl = `${process.env.QUEUE_BASE_URL}/${QueueName}`;
            const attributeNames = ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"];
            const getQueueAttributesParams = {
                QueueUrl: queueUrl,
                AttributeNames: attributeNames,
            };

            const client = await this._getClient();
            const getMessageCommand = new GetQueueAttributesCommand(getQueueAttributesParams);
            const data = await client.send(getMessageCommand);
            if (data.$metadata.httpStatusCode == 200) {
                if (data.Attributes) {
                    return parseInt(data.Attributes.ApproximateNumberOfMessages) + parseInt(data.Attributes.ApproximateNumberOfMessagesNotVisible);
                }

            } else {
                return 0;
            }

        } catch (e: any) {
            console.log("Error in get count", e.$metadata.httpStatusCode);
            if (e.$metadata.httpStatusCode) {
                return 0;
            }
        }
    }


}