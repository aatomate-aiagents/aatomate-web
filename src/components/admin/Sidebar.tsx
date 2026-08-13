"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  MessageCircle,
  MessageSquare,
  Box,
  HelpCircle,
  Mail
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Cold Email", href: "/admin/outreach", icon: Mail },
  { name: "Inbox", href: "/admin/inbox", icon: MessageCircle },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Demo Schedule", href: "/admin/demos", icon: Calendar },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Clients", href: "/admin/clients", icon: Briefcase },
  { name: "Case Studies", href: "/admin/case-studies", icon: FileText },
  { name: "Use Cases", href: "/admin/use-cases", icon: Sparkles },
  { name: "Services", href: "/admin/services", icon: Briefcase },
  { name: "Pricing", href: "/admin/pricing", icon: CreditCard },
  { name: "Testimonials", href: "/admin/testimonials", icon: Users },
  { name: "FAQs", href: "/admin/faqs", icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] bg-white dark:bg-[#050505] border-r border-gray-200 dark:border-[#1F1F1F] flex flex-col h-full fixed md:relative z-30 transition-colors duration-300">
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          // Special case for dashboard root
          const isDashboardRoot = item.href === "/admin" && pathname === "/admin";
          const finalIsActive = item.href === "/admin" ? isDashboardRoot : isActive;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                finalIsActive
                  ? "bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#151515] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon
                className={clsx(
                  "w-4 h-4 flex-shrink-0 transition-colors",
                  finalIsActive ? "text-blue-600 dark:text-white" : "text-gray-400 dark:text-gray-500"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1F1F1F] space-y-1">
        <Link
          href="/admin/settings"
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith("/admin/settings")
              ? "bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#151515] hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Settings
        </Link>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
