"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/strategy", label: "戦略", icon: "🎯" },
  { href: "/dashboard/keywords", label: "キーワード", icon: "🔍" },
  { href: "/dashboard/competitors", label: "競合分析", icon: "👥" },
  { href: "/dashboard/content", label: "コンテンツ", icon: "📝" },
  { href: "/dashboard/rankings", label: "順位", icon: "📈" },
  { href: "/dashboard/analytics", label: "分析", icon: "📉" },
  { href: "/dashboard/aio", label: "AIO", icon: "🤖" },
  { href: "/dashboard/settings", label: "設定", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-60 shrink-0 bg-[#1B2A4A] p-4 text-white">
      <h1 className="mb-6 text-lg font-bold">SEO Master</h1>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-white/10",
              pathname === link.href && "bg-white/20",
            )}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
