import Iyzipay from 'iyzipay';
import dotenv from 'dotenv';

dotenv.config();

const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzico.com'
});

export default iyzico;
