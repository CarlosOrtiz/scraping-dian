import { registerAs } from "@nestjs/config";

export default registerAs('dianConfig', () => ({
  dian_user: process.env.DIAN_USER,
  dian_password: process.env.DIAN_PASSWORD
}))