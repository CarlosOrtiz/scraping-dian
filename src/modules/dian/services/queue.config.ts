import { JobOptions, AdvancedSettings } from "bull";

interface QueueOptions {
  limiter?: RateLimiter;
  redis?: RedisOpts;
  prefix?: 'bull'; // prefix for all queue keys.
  defaultJobOptions?: JobOptions;
  settings?: AdvancedSettings;
}

interface RateLimiter {
  max: 1,      // Max number of jobs processed
  duration: number, // per duration in milliseconds
  bounceBack: false; // When jobs get rate limited, they stay in the waiting queue and are not moved to the delayed queue
}

interface RedisOpts {
  port?: 6379;
  host?: 'localhost';
  db?: 0;
  password?: '';
}

export default QueueOptions;
