import Link from "next/link";
import { Check, Circle, Sparkles } from "lucide-react";

type Item = { label: string; href: string; done: boolean };

/**
 * Checklist de onboarding para talleres recién registrados.
 * Muestra los primeros pasos recomendados.
 */
export function OnboardingChecklist({
  workshopName,
  items,
  pendingApproval,
}: {
  workshopName: string;
  items: Item[];
  pendingApproval: boolean;
}) {
  const doneCount = items.filter((i) => i.done).length;

  return (
    <div className="card mb-5 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rapid-green-soft text-rapid-green-dark">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-rapid-text">
            ¡Bienvenido, {workshopName}!
          </h2>
          <p className="mt-1 text-sm text-rapid-text-muted">
            Completa estos pasos para sacarle provecho a Rapid. ({doneCount}/
            {items.length})
          </p>

          {pendingApproval && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Tu perfil público está en revisión. Mientras tanto ya puedes usar
              todas las herramientas del taller.
            </div>
          )}

          <ul className="mt-4 space-y-2.5">
            {items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="flex items-center gap-3 rounded-lg px-2 py-1.5 -mx-2 transition-colors hover:bg-rapid-surface-soft"
                >
                  {it.done ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rapid-green text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    <Circle className="h-5 w-5 text-rapid-text-subtle" />
                  )}
                  <span
                    className={
                      it.done
                        ? "text-sm text-rapid-text-muted line-through"
                        : "text-sm font-medium text-rapid-text"
                    }
                  >
                    {it.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
