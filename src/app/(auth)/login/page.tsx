"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Shield, Zap, Users, MapPin } from "lucide-react";

function BusIllustration() {
  return (
    <svg viewBox="0 0 600 350" fill="none" preserveAspectRatio="xMinYMax meet" className="w-full h-auto text-primary-foreground">
      <rect x="50" y="110" width="420" height="130" rx="24" className="fill-current opacity-30" />
      <path d="M50,160 L50,130 C50,108 72,95 105,95 L415,95 C448,95 470,108 470,130 L470,160 Z" className="fill-current opacity-20" />
      <rect x="400" y="108" width="55" height="55" rx="8" className="fill-current opacity-40" />
      <rect x="82" y="112" width="62" height="44" rx="6" className="fill-current opacity-50" />
      <rect x="155" y="112" width="62" height="44" rx="6" className="fill-current opacity-50" />
      <rect x="228" y="112" width="62" height="44" rx="6" className="fill-current opacity-50" />
      <rect x="301" y="112" width="62" height="44" rx="6" className="fill-current opacity-50" />
      <rect x="50" y="212" width="420" height="28" rx="6" className="fill-current opacity-50" />
      <rect x="450" y="190" width="18" height="14" rx="4" className="fill-accent/40" />
      <circle cx="150" cy="250" r="28" className="fill-current opacity-20" />
      <circle cx="150" cy="250" r="14" className="fill-current opacity-40" />
      <circle cx="370" cy="250" r="28" className="fill-current opacity-20" />
      <circle cx="370" cy="250" r="14" className="fill-current opacity-40" />
    </svg>
  );
}

function RoadCurves() {
  return (
    <svg viewBox="0 0 600 200" preserveAspectRatio="xMaxYMax meet" className="w-full h-full text-accent">
      <path d="M0,160 C120,110 220,190 340,90 C400,40 460,110 600,50" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.35" strokeLinecap="round" />
      <path d="M0,190 C140,135 250,215 370,115 C430,65 490,145 600,80" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" strokeLinecap="round" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function BenefitItem({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06]">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <div className="flex min-h-svh">
      {/* ===== LEFT PANEL (60%, hidden on mobile) ===== */}
      <div className="relative hidden w-[60%] lg:flex flex-col overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,color-mix(in_oklch,var(--primary-foreground)_6%,transparent),transparent_70%)]" />

        <div className="relative z-30 flex flex-col items-center justify-center flex-1 px-16">
          <div className="flex flex-col items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/90 shadow-sm">
              <LayoutDashboard className="h-10 w-10 text-accent-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">
                TRANS ESPECIALES FDO
              </h1>
              <p className="mt-3 text-sm uppercase tracking-[0.15em] text-primary-foreground/60">
                Transporte Confiable, Siempre.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 z-20 h-48 w-full overflow-hidden pointer-events-none">
          <RoadCurves />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-10 h-[55%] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-[65%] opacity-20 blur-[1.5px]">
            <BusIllustration />
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (40%) ===== */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/[0.03] p-4 lg:p-8">
        <div className="absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/[0.02] blur-3xl" />

        {/* Mobile branding */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-sm">
            <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-lg font-bold">Transespeciales ERP</h1>
          <p className="mt-1 text-xs text-muted-foreground">Transporte Confiable, Siempre.</p>
        </div>

        {/* Glass card */}
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards">
          <div className="rounded-2xl border border-border/40 bg-card/70 shadow-sm backdrop-blur-xl">
            <div className="p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold">Bienvenido</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Inicia sesión para acceder al sistema
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Usuario</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" className="rounded border-border" />
                    Recordarme
                  </label>
                  <button type="button" onClick={() => {}} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="w-full h-12 bg-cta text-cta-foreground hover:bg-cta/90 text-base font-medium transition-all duration-200 active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>

              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/80 px-2 text-xs text-muted-foreground backdrop-blur-sm">
                  O continúa con
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full h-11"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <GoogleIcon className="mr-2 h-5 w-5" />
                {googleLoading ? "Conectando..." : "Ingresar con Google"}
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits desktop */}
        <div className="mt-8 hidden w-full max-w-sm animate-in fade-in duration-700 delay-300 fill-mode-backwards lg:block">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <BenefitItem icon={Shield} title="Seguro" description="Tu información está protegida" />
            <BenefitItem icon={Zap} title="Confiable" description="Sistema para operación diaria" />
            <BenefitItem icon={Users} title="Eficiente" description="Herramientas que optimizan la gestión" />
            <BenefitItem icon={MapPin} title="Siempre contigo" description="Disponible desde cualquier lugar" />
          </div>
        </div>

        {/* Benefits mobile */}
        <div className="mt-6 w-full max-w-sm lg:hidden">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <BenefitItem icon={Shield} title="Seguro" description="Protegido" />
            <BenefitItem icon={Zap} title="Confiable" description="24/7" />
            <BenefitItem icon={Users} title="Eficiente" description="Optimizado" />
            <BenefitItem icon={MapPin} title="Disponible" description="Siempre" />
          </div>
        </div>
      </div>
    </div>
  );
}
