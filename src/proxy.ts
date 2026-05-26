import { authkitProxy } from "@workos-inc/authkit-nextjs";

export default authkitProxy({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: [],
  },
});

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/hub",
    "/hub/:path*",
    "/discord",
    "/discord/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
