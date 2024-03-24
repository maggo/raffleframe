import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.VERCEL_URL || "http://localhost:3000";
  const frameMetadata = await getFrameMetadata(`${url}/api`);
  return {
    title: "Raffleframe",
    other: frameMetadata,
  };
}

export default function Page() {
  return <h1>Rafflecopter</h1>;
}
