import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/** Protect /account/* and drop sessions invalidated by a password change. */
export default async function AccountLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect("/login?redirect=/account");
  }

  return children;
}
