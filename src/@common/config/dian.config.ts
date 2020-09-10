import { registerAs } from "@nestjs/config";

export default registerAs('dianConfig', () => ({
  download_path: process.env.DOWNLOAD_PATH,
  dian_url_base: process.env.DIAN_URL_BASE
}))