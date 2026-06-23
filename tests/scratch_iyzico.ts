import Iyzipay from "../services/payment-service/node_modules/iyzipay";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../server/.env") });

const iyzico = new Iyzipay({
  apiKey: "sandbox-0cGYDXUB8pZ5idy0zjoOjMxr6PyAHMKU",
  secretKey: "NTQ6Zprsoag2FtkGTPGSudodDOMWRY7s",
  uri: "https://sandbox-api.iyzipay.com"
});

console.log("Testing keys:");
console.log("API KEY:", process.env.IYZICO_API_KEY);
console.log("SECRET KEY:", process.env.IYZICO_SECRET_KEY);

iyzico.installmentInfo.retrieve({
  locale: "tr",
  conversationId: "123456",
  binNumber: "589004",
  price: "100"
}, (err: any, result: any) => {
  if (err) {
    console.error("SDK Error:", err);
  } else {
    console.log("Iyzico response:", JSON.stringify(result, null, 2));
  }
});
