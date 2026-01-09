"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  MapPin,
  Settings,
  Calculator,
  UserCheck,
  Presentation,
  AlertTriangle,
  BookHeart,
} from "lucide-react";

// Grouped navigation with clear hierarchy
const navGroups = [
  {
    items: [
      { name: "Overview", href: "/", icon: LayoutDashboard },
    ]
  },
  {
    label: "Data",
    items: [
      { name: "Participants", href: "/participants", icon: Users },
      { name: "Outcomes", href: "/outcomes", icon: TrendingUp },
      { name: "Geography", href: "/geography", icon: MapPin },
    ]
  },
  {
    label: "Analysis",
    items: [
      { name: "Stories", href: "/stories", icon: BookHeart },
      { name: "Cliff Analysis", href: "/cliff-analysis", icon: AlertTriangle },
      { name: "ROI", href: "/roi", icon: Calculator },
    ]
  },
  {
    label: "Operations",
    items: [
      { name: "Navigators", href: "/navigators", icon: UserCheck },
      { name: "Fundraising", href: "/fundraising", icon: Presentation },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-52 bg-white border-r border-gray-200/60 h-screen flex flex-col">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-100">
        <Image
          src="/logo.png"
          alt="Empower Upper Cumberland"
          width={506}
          height={181}
          className="w-full h-auto"
          priority
        />
      </div>

      {/* Navigation - grouped */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-6">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.label && (
                <div className="px-2 mb-2">
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all",
                        isActive
                          ? "bg-[#1E3A5F]/5 text-[#1E3A5F] font-medium"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isActive ? "text-[#1E3A5F]" : "text-gray-400"
                        )}
                        strokeWidth={1.5}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all",
            pathname === "/settings"
              ? "bg-[#1E3A5F]/5 text-[#1E3A5F] font-medium"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          )}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
