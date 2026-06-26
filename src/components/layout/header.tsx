"use client";

import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, Menu, Monitor, Palette, Moon } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useSidebar } from "./sidebar-context";

const themeOptions = [
  { value: "classic", label: "Classic", icon: Monitor },
  { value: "transespeciales", label: "Transespeciales", icon: Palette },
  { value: "dark", label: "Dark", icon: Moon },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const { toggleMobile } = useSidebar();
  const [open, setOpen] = useState(false);

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const currentTheme = themeOptions.find((t) => t.value === theme) ?? themeOptions[1];
  const ThemeIcon = currentTheme.icon;

  const handleThemeChange = useCallback((value: string) => {
    setTheme(value);
    setOpen(false);
  }, [setTheme]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-md px-4 sm:px-6 transition-colors duration-200">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobile}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ThemeIcon className="h-4 w-4" />
            <span className="text-xs hidden sm:inline">{currentTheme.label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Apariencia</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                className={opt.value === theme ? "bg-accent/20 font-medium" : ""}
              >
                <Icon className="mr-2 h-4 w-4" />
                {opt.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{session?.user?.name || "Usuario"}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {session?.user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            Perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
