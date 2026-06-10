import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const employeeRoutes = ["/dashboard", "/profile/edit", "/profile/preview"];
const employerRoutes = ["/search", "/saved", "/hiring", "/candidates", "/swipe"];
const authRequired = [...employeeRoutes, ...employerRoutes, "/messages", "/settings"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;

  const isAuthRequired = authRequired.some((r) => path.startsWith(r));
  if (isAuthRequired && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (session) {
    const role = session.user?.role;

    if (role === "EMPLOYEE" && employerRoutes.some((r) => path.startsWith(r))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (role === "EMPLOYER" && employeeRoutes.some((r) => path.startsWith(r))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
