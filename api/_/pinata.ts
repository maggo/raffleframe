import PinataSDK from "@pinata/sdk";

// @ts-ignore
export const pinata: PinataSDK.default = new PinataSDK(
  import.meta.env.VITE_PINATA_API_KEY!,
  import.meta.env.VITE_PINATA_API_SECRET!,
);
