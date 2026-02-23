import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Header() {
  let email = "Guest";
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      email = session.user.email;
    }
  } catch {
    // Auth not configured yet — show as Guest
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <p className="text-sm font-medium text-slate-700">SEO / AIO Dashboard</p>
      <p className="text-sm text-slate-500">{email}</p>
    </header>
  );
}
