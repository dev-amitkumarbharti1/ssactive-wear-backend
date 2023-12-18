import { createClient } from 'redis'; // Import the redis module

// Create a Redis client
const redisClient = createClient();

redisClient.connect();
export default redisClient;