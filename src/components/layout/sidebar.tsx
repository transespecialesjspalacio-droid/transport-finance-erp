"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { navItems, iconMap } from "./nav-items";
import { useSidebar } from "./sidebar-context";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  X,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, setMobileOpen } = useSidebar();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const navLinks = navItems.map((item) => {
    const Icon = iconMap[item.icon];
    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={handleNavClick}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        {!collapsed && <span>{item.title}</span>}
      </Link>
    );
  });

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r bg-sidebar transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold">Transporte ERP</span>
          )}
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">{navLinks}</nav>
        </ScrollArea>

        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r bg-sidebar shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Transporte ERP</span>
          <button
            className="ml-auto rounded-md p-1 hover:bg-sidebar-accent"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-1">{navLinks}</nav>
        </ScrollArea>
      </aside>
    </>
  );
}
