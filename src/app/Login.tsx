import React, { useState } from "react";
import { Heart } from "lucide-react";
import {
  loginUser,
  sendPasswordReset,
  translateAuthError,
} from "../services/auth";

export function LoginPage({ onBack, onRegister, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [resetInfo, setResetInfo] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (sendingReset) return;
    setServerError(null);
    setResetInfo(null);

    if (!email.trim()) {
      setServerError("Informe o seu e-mail para recuperar a senha.");
      return;
    }

    setSendingReset(true);
    try {
      await sendPasswordReset(email.trim());
      setResetInfo(
        `Link enviado para ${email.trim()}. Verifique sua caixa de entrada.`
      );
    } catch (error) {
      setServerError(translateAuthError(error));
    } finally {
      setSendingReset(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setResetInfo(null);
    setLoading(true);
    try {
      const credential = await loginUser({ email, password });
      const name =
        credential?.user?.displayName || email.split("@")[0];
      if (onLoginSuccess) onLoginSuccess(name);
    } catch (error) {
      setServerError(translateAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #383939 0%, #149C68 60%, #38C958 100%)" }}
    >
      <div
        className="fixed top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "#38C958" }}
      />
      <div
        className="fixed bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "#AEE637" }}
      />

      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        style={{
          background: "rgba(56,57,57,0.85)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(174,230,55,0.25)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, #149C68, #38C958, #AEE637)" }}
        />

        <div className="space-y-7">
          {onBack && (
            <button
              onClick={onBack}
              style={{ color: "#38C958", fontSize: "0.85rem" }}
              className="flex items-center gap-1 hover:text-[#AEE637] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          )}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#149C68" }}
              >
                <Heart size={11} fill="#AEE637" />
              </div>
              <span
                style={{
                  color: "#FFFEDB",
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                Doe Fácil
              </span>
            </div>
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #149C68, #AEE637)" }}
            >
              <svg
                className="w-8 h-8"
                style={{ color: "#383939" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <h1
                style={{
                  color: "#FFFEDB",
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Bem-vindo de volta
              </h1>
              <p style={{ color: "#38C958", marginTop: "4px" }}>
                Faça login na sua conta
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                style={{ color: "#AEE637", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#38C958]/40"
                style={{
                  background: "rgba(20,156,104,0.15)",
                  border: "1px solid rgba(56,201,88,0.4)",
                  color: "#FFFEDB",
                  borderRadius: "12px",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  style={{ color: "#AEE637", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={sendingReset}
                  style={{
                    color: "#38C958",
                    fontSize: "0.8rem",
                    cursor: sendingReset ? "wait" : "pointer",
                    opacity: sendingReset ? 0.7 : 1,
                  }}
                  className="hover:text-[#AEE637] transition-colors bg-transparent border-0 p-0"
                >
                  {sendingReset ? "Enviando..." : "Esqueceu a senha?"}
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#38C958]/40"
                style={{
                  background: "rgba(20,156,104,0.15)",
                  border: "1px solid rgba(56,201,88,0.4)",
                  color: "#FFFEDB",
                  borderRadius: "12px",
                }}
              />
            </div>

            <div className="flex items-center gap-2.5">
              <div
                onClick={() => setRemember(!remember)}
                className="w-5 h-5 rounded-md flex items-center justify-center cursor-pointer transition-all"
                style={{
                  background: remember ? "#149C68" : "rgba(20,156,104,0.15)",
                  border: `1.5px solid ${remember ? "#38C958" : "rgba(56,201,88,0.4)"}`,
                }}
              >
                {remember && (
                  <svg
                    className="w-3 h-3"
                    style={{ color: "#AEE637" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <label
                onClick={() => setRemember(!remember)}
                style={{ color: "#FFFEDB", fontSize: "0.875rem", cursor: "pointer" }}
              >
                Lembrar-me
              </label>
            </div>

            {serverError && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(212,24,61,0.12)", color: "#ff8fa3", border: "1px solid rgba(212,24,61,0.4)" }}
              >
                {serverError}
              </div>
            )}

            {resetInfo && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "rgba(56,201,88,0.12)", color: "#8ff0a9", border: "1px solid rgba(56,201,88,0.4)" }}
              >
                {resetInfo}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full shadow-lg transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #149C68 0%, #38C958 60%, #AEE637 100%)",
                border: "none",
                borderRadius: "12px",
                padding: "12px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: "#383939",
                cursor: loading ? "wait" : "pointer",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="text-center" style={{ color: "#38C958", fontSize: "0.875rem" }}>
            Não tem uma conta?{" "}
            <span
              onClick={onRegister}
              style={{ color: "#AEE637", fontWeight: 600, cursor: "pointer" }}
              className="hover:text-[#FFFEDB] transition-colors"
            >
              Cadastre-se
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}