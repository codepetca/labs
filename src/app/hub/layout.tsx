import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

export default function HubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthKitProvider>{children}</AuthKitProvider>;
}
