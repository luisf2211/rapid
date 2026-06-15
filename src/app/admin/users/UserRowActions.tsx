"use client";

import { useTransition } from "react";
import { toggleUserActiveAction } from "../actions";

export function UserRowActions({
  id,
  isActive,
}: {
  id: number;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      className="text-xs font-semibold text-rapid-green-dark hover:underline disabled:opacity-50"
      onClick={() =>
        startTransition(async () => {
          await toggleUserActiveAction(id, !isActive);
        })
      }
    >
      {isActive ? "Desactivar" : "Activar"}
    </button>
  );
}
