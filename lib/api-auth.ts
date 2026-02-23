import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireApiSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  return session;
}
