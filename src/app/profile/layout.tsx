import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthKitProvider>{children}</AuthKitProvider>;
}
