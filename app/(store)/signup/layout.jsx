import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default async function SignupLayout({ children }) {
  const session = await getSession();
  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/account");
  }
  return children;
}
