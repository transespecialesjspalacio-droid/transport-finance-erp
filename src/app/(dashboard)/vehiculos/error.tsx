"use client";

export default function VehiculosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12">
      <h2 className="text-xl font-semibold">Error en vehículos</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
      )}
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        onClick={() => reset()}
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
