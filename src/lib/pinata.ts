import PinataSDK from "@pinata/sdk";
import { PinataFDK } from "pinata-fdk";

export const pinata = new PinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!,
);

export const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT!,
  pinata_gateway: "black-determined-nightingale-683.mypinata.cloud",
});
