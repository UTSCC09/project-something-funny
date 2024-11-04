import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost', // Update with your Redis host
  port: 6379,        // Default Redis port
});

export default redis;
