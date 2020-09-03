import { registerAs } from "@nestjs/config";

export default registerAs('redisConfig', () => ({
  port: +process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  db: process.env.REDIS_DB,
  password: process.env.REDIS_PASSWORD
}))