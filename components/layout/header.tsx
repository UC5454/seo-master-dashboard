import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <p className="text-sm font-medium text-slate-700">SEO / AIO Dashboard</p>
      <p className="text-sm text-slate-500">{session?.user?.email ?? "Guest"}</p>
    </header>
  );
}
