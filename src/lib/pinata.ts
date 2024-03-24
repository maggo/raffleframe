import PinataSDK from "@pinata/sdk";

// @ts-ignore
export const pinata: PinataSDK.default = new PinataSDK(
  process.env.PINATA_API_KEY!,
  process.env.PINATA_API_SECRET!,
);
