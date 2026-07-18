import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authed = request.cookies.get("wt_user");
  const { pathname } = request.nextUrl;
  if (!authed && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authed && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
