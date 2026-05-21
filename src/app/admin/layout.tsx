import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthKitProvider>{children}</AuthKitProvider>;
}
