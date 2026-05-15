"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

const tabs = [
  { href: "/dashboard", label: "홈", icon: "🏠" },
  { href: "/capture", label: "촬영", icon: "📷" },
  { href: "/list", label: "목록", icon: "📋" },
  { href: "/report", label: "리포트", icon: "📊" },
  { href: "/more", label: "더보기", icon: "⋯" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link key={tab.href} href={tab.href}
              className={clsx(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 card-hover",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"
              )}>
              <span className="text-2xl leading-none">{tab.icon}</span>
              <span className={clsx("text-xs font-medium",
                isActive ? "font-semibold" : ""
              )}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
