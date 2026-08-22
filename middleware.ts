import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const auth = request.cookies.get("zopavo_auth");
  const { pathname } = request.nextUrl;

  if (!auth && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (auth && pathname === "/login") {
    return NextResponse.redirect(new URL("/board", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
