"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/ui/logo";
import { Loader2, Shield, Clock, Handshake, Kanban } from "lucide-react";

function BusIllustration() {
  return (
    <svg viewBox="0 0 700 400" fill="none" preserveAspectRatio="xMinYMax meet" className="w-full h-auto text-primary-foreground">
      <path d="M60,140 L60,110 C60,88 82,75 115,75 L500,75 C530,75 555,88 570,105 L600,140 Z" className="fill-current" opacity="0.15" />
      <rect x="55" y="125" width="550" height="150" rx="28" className="fill-current" opacity="0.25" />
      <rect x="55" y="240" width="550" height="35" rx="8" className="fill-current" opacity="0.4" />
      <path d="M520,88 L590,88 C598,88 600,95 600,100 L600,135 L520,135 Z" className="fill-current" opacity="0.35" />
      <rect x="530" y="100" width="55" height="28" rx="6" className="fill-current" opacity="0.2" />
      <rect x="90" y="98" width="70" height="50" rx="8" className="fill-current" opacity="0.45" />
      <rect x="172" y="98" width="70" height="50" rx="8" className="fill-current" opacity="0.45" />
      <rect x="254" y="98" width="70" height="50" rx="8" className="fill-current" opacity="0.45" />
      <rect x="336" y="98" width="70" height="50" rx="8" className="fill-current" opacity="0.45" />
      <rect x="418" y="98" width="70" height="50" rx="8" className="fill-current" opacity="0.45" />
      <rect x="578" y="210" width="22" height="16" rx="5" className="fill-accent/40" />
      <rect x="578" y="235" width="22" height="12" rx="4" className="fill-current" opacity="0.2" />
      <circle cx="175" cy="286" r="34" className="fill-current" opacity="0.15" />
      <circle cx="175" cy="286" r="16" className="fill-current" opacity="0.3" />
      <circle cx="175" cy="286" r="6" className="fill-current" opacity="0.4" />
      <circle cx="485" cy="286" r="34" className="fill-current" opacity="0.15" />
      <circle cx="485" cy="286" r="16" className="fill-current" opacity="0.3" />
      <circle cx="485" cy="286" r="6" className="fill-current" opacity="0.4" />
    </svg>
  );
}

function RoadCurves() {
  return (
    <svg viewBox="0 0 700 260" preserveAspectRatio="xMaxYMax meet" className="w-full h-full">
      <path d="M0,200 C150,140 280,220 420,120 C490,70 560,145 700,85" className="stroke-accent" strokeWidth="4" fill="none" opacity="0.4" strokeLinecap="round" />
      <path d="M0,230 C170,165 310,245 450,145 C520,95 590,175 700,115" className="stroke-accent" strokeWidth="2.5" fill="none" opacity="0.25" strokeLinecap="round" />
      <path d="M0,260 C190,190 340,270 480,170 C550,120 620,205 700,145" className="stroke-accent" strokeWidth="1.5" fill="none" opacity="0.15" strokeLinecap="round" />
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
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{description}</p>
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
  const [showSplash, setShowSplash] = useState(false);

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
      setShowSplash(true);
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  }

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  if (showSplash) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-background">
        <div className="animate-in fade-in duration-700 fill-mode-backwards flex flex-col items-center gap-4">
          <Logo className="h-20 w-20" />
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight">Transespeciales ERP</h1>
            <p className="mt-2 text-sm text-muted-foreground animate-pulse">
              Preparando tu espacio de trabajo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh">
      {/* ===== LEFT PANEL (60%, hidden on mobile) ===== */}
      <div className="relative hidden w-[60%] flex-col overflow-hidden bg-primary lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,color-mix(in_oklch,var(--primary-foreground)_6%,transparent),transparent_70%)]" />

        <div className="relative z-30 flex flex-1 flex-col items-center justify-center px-16">
          <div className="flex flex-col items-center gap-5">
            <Logo className="h-24 w-24 animate-in fade-in duration-450 fill-mode-backwards" />
            <div className="text-center">
              <h1 className="animate-in fade-in slide-in-from-bottom-2 duration-450 delay-150 fill-mode-backwards text-3xl font-bold tracking-tight text-primary-foreground">
                TRANS ESPECIALES FDO
              </h1>
              <p className="animate-in fade-in slide-in-from-bottom-2 duration-450 delay-300 fill-mode-backwards mt-3 text-sm uppercase tracking-[0.15em] text-primary-foreground/60">
                Transporte Confiable, Siempre.
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 right-0 z-20 h-52 w-full overflow-hidden">
          <RoadCurves />
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-[55%] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-[65%] opacity-20 blur-[1.5px]">
            <BusIllustration />
          </div>
        </div>
      </div>

      {/* ===== RIGHT PANEL (40%) ===== */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/[0.03] p-4 lg:p-8">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.02] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-accent/[0.02] blur-3xl" />

        {/* Mobile branding */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <Logo className="h-14 w-14" />
          <h1 className="mt-3 text-lg font-bold">Transespeciales ERP</h1>
          <p className="mt-1 text-xs text-muted-foreground">Transporte Confiable, Siempre.</p>
        </div>

        {/* Glass card — animated entrance */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-450 delay-450 fill-mode-backwards w-full max-w-sm">
          <div className="rounded-2xl border border-border/30 bg-card/70 shadow-sm backdrop-blur-xl">
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
                  className="flex w-full h-12 items-center justify-center gap-2 bg-cta text-cta-foreground hover:bg-cta/90 text-base font-medium transition-all duration-200 active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
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
                {googleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Ingresar con Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits desktop */}
        <div className="mt-8 hidden w-full max-w-sm animate-in fade-in duration-450 delay-[600ms] fill-mode-backwards lg:block">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <BenefitItem icon={Shield} title="Seguridad" description="Protección de la información y acceso seguro" />
            <BenefitItem icon={Clock} title="Puntualidad" description="Planeación y seguimiento de cada servicio" />
            <BenefitItem icon={Handshake} title="Confianza" description="Operación diseñada para empresas de transporte" />
            <BenefitItem icon={Kanban} title="Gestión Inteligente" description="Toda la operación desde un único lugar" />
          </div>
        </div>

        {/* Benefits mobile */}
        <div className="mt-6 w-full max-w-sm lg:hidden">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <BenefitItem icon={Shield} title="Seguridad" description="Información protegida" />
            <BenefitItem icon={Clock} title="Puntualidad" description="Seguimiento diario" />
            <BenefitItem icon={Handshake} title="Confianza" description="Para empresas de transporte" />
            <BenefitItem icon={Kanban} title="Gestión Inteligente" description="Todo desde un lugar" />
          </div>
        </div>

        {/* Version info */}
        <p className="mt-6 text-[11px] text-muted-foreground/50">
          Transespeciales ERP v1.0.0
        </p>
      </div>
    </div>
  );
}
