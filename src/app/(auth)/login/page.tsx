"use client";

import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Shield, Clock3, Handshake, SlidersHorizontal } from "lucide-react";

function NoiseTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 opacity-[0.02]"
      aria-hidden="true"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    />
  );
}

function CurvesDecoration() {
  return (
    <div className="pointer-events-none fixed bottom-0 left-0 z-0">
      <svg
        viewBox="0 0 400 300"
        className="w-[240px] h-[180px] sm:w-[320px] sm:h-[240px] lg:w-[400px] lg:h-[300px]"
        fill="none"
      >
        <path
          d="M0,280 C80,160 160,240 240,120 C280,60 340,100 400,40"
          className="stroke-primary"
          strokeWidth="1.5"
          opacity="0.2"
          strokeLinecap="round"
        />
        <path
          d="M0,290 C90,180 180,260 270,140 C310,80 360,120 400,60"
          className="stroke-primary"
          strokeWidth="1"
          opacity="0.25"
          strokeLinecap="round"
        />
        <path
          d="M0,300 C100,200 200,280 300,160 C340,100 380,140 400,80"
          className="stroke-accent"
          strokeWidth="0.75"
          opacity="0.35"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function BenefitItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/[0.08]">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground leading-snug line-clamp-2">
          {description}
        </p>
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

  const handleGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    setError("");
    await signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <NoiseTexture />

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,var(--primary)_0%,transparent_65%)] opacity-[0.03]" />

      <CurvesDecoration />

      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-[520px]">
          <div className="text-center mb-14">
            <p className="text-sm text-muted-foreground">Bienvenido a</p>
            <h1 className="mt-1 text-[34px] sm:text-[40px] font-bold tracking-tight leading-tight">
              TRANSESPECIALES
              <span className="text-accent">FDO</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Inicia sesión para acceder al sistema.
            </p>
          </div>

          <Card className="rounded-[20px] border-border/40 bg-card/90 shadow-[0_2px_20px_-6px_rgba(0,0,0,0.06)] backdrop-blur-[18px]">
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="space-y-2.5">
                  <Label htmlFor="email">Usuario</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-[54px] rounded-[14px] border-border/60 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/50"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-[54px] rounded-[14px] border-border/60 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      className="rounded border-border/60 accent-primary"
                    />
                    Recordarme
                  </label>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  className="flex w-full h-[56px] items-center justify-center gap-2 rounded-[14px] bg-cta text-cta-foreground hover:bg-cta/85 text-[15px] font-semibold transition-all duration-200 active:scale-[0.99]"
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

              <div className="relative my-8">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
                  O continúa con
                </span>
              </div>

              <Button
                variant="outline"
                className="w-full h-[56px] rounded-[14px] border-border/60 transition-all duration-200 hover:bg-accent/5"
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
          </Card>

          <div className="mt-10 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
              <Shield className="h-3 w-3" />
              <span>Plataforma segura y protegida</span>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground/40">
              &copy; 2026 TransespecialesFDO. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 pb-16">
        <div className="mx-auto max-w-[1000px] px-4">
          <Card className="rounded-[20px] border-border/30 shadow-sm">
            <div className="px-10 py-6">
              <div className="hidden md:grid md:grid-cols-4 md:gap-0 md:items-center">
                <BenefitItem
                  icon={Shield}
                  title="Seguridad"
                  description="Protección de la información y acceso seguro."
                />
                <div className="h-12 w-px bg-border/30" />
                <BenefitItem
                  icon={Clock3}
                  title="Puntualidad"
                  description="Planeación y seguimiento de cada servicio."
                />
                <div className="h-12 w-px bg-border/30" />
                <BenefitItem
                  icon={Handshake}
                  title="Confianza"
                  description="Operación diseñada para empresas de transporte."
                />
                <div className="h-12 w-px bg-border/30" />
                <BenefitItem
                  icon={SlidersHorizontal}
                  title="Gestión Inteligente"
                  description="Toda la operación desde un único lugar."
                />
              </div>
              <div className="flex flex-col gap-8 md:hidden">
                <BenefitItem
                  icon={Shield}
                  title="Seguridad"
                  description="Protección de la información y acceso seguro."
                />
                <BenefitItem
                  icon={Clock3}
                  title="Puntualidad"
                  description="Planeación y seguimiento de cada servicio."
                />
                <BenefitItem
                  icon={Handshake}
                  title="Confianza"
                  description="Operación diseñada para empresas de transporte."
                />
                <BenefitItem
                  icon={SlidersHorizontal}
                  title="Gestión Inteligente"
                  description="Toda la operación desde un único lugar."
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
