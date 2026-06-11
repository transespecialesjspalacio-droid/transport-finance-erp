"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function FormActions() {
  const { pending } = useFormStatus();

  return (
    <div className="flex items-center gap-2 pt-4">
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Guardando..." : "Guardar"}
      </Button>
      <Button type="button" variant="outline" onClick={() => window.history.back()}>
        Cancelar
      </Button>
    </div>
  );
}
