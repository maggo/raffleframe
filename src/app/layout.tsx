export const metadata = {
  title: "Farcaster Giveaway Frame",
  description: "lol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
