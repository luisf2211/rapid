import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rapid-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-rapid-green-dark text-white items-center justify-center text-2xl font-bold mb-4">
            R
          </div>
          <h1 className="text-2xl font-bold text-rapid-text">Rapid Taller</h1>
          <p className="text-sm text-rapid-text-muted mt-1">
            Inicia sesión con tu cuenta de empresa
          </p>
        </div>

        <div className="card p-6">
          <Suspense fallback={<p className="text-sm text-rapid-text-muted">Cargando...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
