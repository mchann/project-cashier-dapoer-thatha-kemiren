import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Jika user mengakses /admin tapi bukan superadmin, redirect ke /pos
    if (path.startsWith("/admin") && token?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/pos", req.url));
    }
  },
  {
    callbacks: {
      // Pastikan user terotentikasi untuk semua URL yang cocok dengan matcher
      authorized: ({ token }) => !!token,
    },
  }
);

// Tentukan rute mana saja yang harus dilindungi middleware ini
export const config = { 
  matcher: [
    "/admin/:path*", 
    "/pos/:path*", 
    "/staff/:path*"
  ] 
};
