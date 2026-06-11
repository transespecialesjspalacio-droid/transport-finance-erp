import {
  Users,
  FileText,
  Bus,
  Truck,
  UserCog,
  DollarSign,
  Receipt,
  TrendingUp,
  Building2,
  Wrench,
  BarChart3,
  Wallet,
} from "lucide-react";
import type { NavItem } from "@/types";

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: "BarChart3" },
  { title: "Clientes", href: "/clientes", icon: "Building2" },
  { title: "Contratos", href: "/contratos", icon: "FileText" },
  { title: "Servicios", href: "/servicios", icon: "Bus" },
  { title: "Vehículos", href: "/vehiculos", icon: "Truck" },
  { title: "Conductores", href: "/conductores", icon: "UserCog" },
  { title: "Costos", href: "/costos", icon: "Wrench" },
  { title: "Terceros", href: "/terceros", icon: "Users" },
  { title: "Cuentas por Cobrar", href: "/cuentas-cobrar", icon: "Receipt" },
  { title: "Cuentas por Pagar", href: "/cuentas-pagar", icon: "DollarSign" },
  { title: "Flujo de Caja", href: "/flujo-caja", icon: "Wallet" },
  { title: "Reportes", href: "/reportes", icon: "TrendingUp" },
];

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  Building2,
  FileText,
  Bus,
  Truck,
  UserCog,
  Wrench,
  Users,
  Receipt,
  DollarSign,
  Wallet,
  TrendingUp,
};
