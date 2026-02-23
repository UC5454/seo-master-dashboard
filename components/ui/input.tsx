import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-[#2C5282] placeholder:text-slate-400 focus:ring-2",
        className,
      )}
      {...props}
    />
  );
}
