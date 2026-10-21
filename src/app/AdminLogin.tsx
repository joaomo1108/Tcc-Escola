import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { loginAdmin, watchAdminSession } from "../services/adminAuth";
import { translateAuthError, watchAuth } from "../services/auth";

type AdminLoginProps = {
  onAdminSuccess: () => void;
  onExit: () => void;
};

// Tela de login EXCLUSIVA do administrador.
// Ela só é aberta digitando "/adm" na barra de endereço.
export default function AdminLogin({ onAdminSuccess, onExit }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [mainUser, setMainUser] = useState<any>(null);
  const [adminReady, setAdminReady] = useState(false);
  const [mainReady, setMainReady] = useState(false);

  useEffect(() => {
    const unsubscribeAdmin = watchAdminSession((user) => {
      setAdminUser(user);
      setAdminReady(true);
    });
    const unsubscribeMain = watchAuth((user) => {
      setMainUser(user);
      setMainReady(true);
    });
    return () => {
      unsubscribeAdmin();
      unsubscribeMain();
    };
  }, []);

  // Só entra no painel quando as DUAS sessões estiverem abertas:
  // a do projeto de administradores e a do projeto principal (onde
  // ficam as doações).
  useEffect(() => {
    if (!adminReady || !mainReady) return;

    if (adminUser && mainUser) {
      onAdminSuccess();
      return;
    }
    if (adminUser && !mainUser) {
      setServerError(
        "Sua sessão no projeto principal expirou. Entre novamente com o mesmo e-mail e senha."
      );
    }
    setCheckingSession(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUser, mainUser, adminReady, mainReady]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);
    setLoading(true);
    try {
      await loginAdmin({ email, password });
      onAdminSuccess();
    } catch (error: any) {
      if (error?.code === "admin/senha-errada-no-projeto-adm") {
        setServerError(
          "E-mail ou senha incorretos no projeto de administradores (doe-facil-adm). Essa é a senha que a portaria aceita — confira a senha exata dessa conta no Firebase."
        );
      } else if (error?.code === "admin/conta-ausente-no-projeto-adm") {
        setServerError(
          "Esta conta não existe no projeto de administradores (doe-facil-adm). Crie a conta lá: Authentication → Add user."
        );
      } else if (error?.code === "admin/conta-ausente-no-projeto-principal") {
        setServerError(
          "Esta conta é administradora, mas não existe no projeto principal (doe-facil-5c2a0). Crie a MESMA conta lá: Authentication → Add user."
        );
      } else if (error?.code === "admin/senha-diferente-no-projeto-principal") {
        setServerError(
          "A portaria aceitou a senha, mas o projeto principal (doe-facil-5c2a0) tem OUTRA senha para este e-mail. Iguale as senhas dos dois projetos e tente de novo."
        );
      } else {
        setServerError(translateAuthError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #383939 0%, #149C68 100%)" }}
      >
        <span style={{ color: "#FFFEDB", fontSize: "0.9rem" }}>Verificando sessão…</span>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #383939 0%, #149C68 60%, #38C958 100%)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        style={{
          background: "rgba(56,57,57,0.9)",
          border: "1px solid rgba(174,230,55,0.35)",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-1 rounded-t-3xl"
          style={{ background: "linear-gradient(90deg, #149C68, #38C958, #AEE637)" }}
        />

        <div className="space-y-6">
          <button
            onClick={onExit}
            style={{ color: "#38C958", fontSize: "0.85rem" }}
            className="flex items-center gap-1 hover:text-[#AEE637] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para o site
          </button>

          <div className="text-center space-y-3">
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #149C68, #AEE637)" }}
            >
              <ShieldCheck size={32} style={{ color: "#383939" }} />
            </div>
            <div>
              <h1
                style={{
                  color: "#FFFEDB",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Área do Administrador
              </h1>
              <p style={{ color: "#AEE637", marginTop: "4px" }}>
                Acesso restrito
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="adm-email"
                style={{ color: "#AEE637", fontSize: "0.875rem", fontWeight: 500 }}
              >
                E-mail do administrador
              </label>
              <input
                id="adm-email"
                type="email"
                placeholder="admin@email.com"
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
              <label
                htmlFor="adm-password"
                style={{ color: "#AEE637", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Senha
              </label>
              <input
                id="adm-password"
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

            {serverError && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  backgroundColor: "rgba(212,24,61,0.15)",
                  color: "#ff8fa3",
                  border: "1px solid rgba(212,24,61,0.45)",
                }}
              >
                {serverError}
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
              {loading ? "Verificando..." : "Entrar no painel"}
            </button>
          </form>

          <p style={{ color: "#38C958", fontSize: "0.78rem", textAlign: "center" }}>
            Esta tela é acessada apenas digitando <strong>/adm</strong> no endereço.
          </p>
        </div>
      </div>
    </div>
  );
}
