import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import { LoginPage } from "./app/Login";
import RegisterPage from "./app/Register";
import Dashboard from "./app/Dashboard";
import DonatePage from "./app/Donate";
import AdminReview from "./app/AdminReview";
import AdminLogin from "./app/AdminLogin";
import { watchAuth, logoutUser } from "./services/auth";
import { logoutAdmin } from "./services/adminAuth";
import { ZoomIn, ZoomOut } from "lucide-react";
import "./styles/tailwind.css";
import "./styles/fonts.css";
import "./styles/theme.css";

// Páginas que só fazem sentido quando há um usuário logado.
const PRIVATE_PAGES = ["dashboard", "donate"];
// Chave usada para lembrar a página atual entre recarregamentos.
const PAGE_STORAGE_KEY = "doe-facil:page";

// A área do administrador é aberta digitando "/adm" na barra de endereço.
function isAdminRoute() {
  const path = window.location.pathname.replace(/\/+$/, "").toLowerCase();
  return path === "/adm";
}

function Main() {
  const adminRoute = isAdminRoute();

  // Começa na página salva (se existir), para não voltar sempre ao início.
  // Digitando "/adm" no endereço, abre direto a tela do administrador.
  const [page, setPage] = useState(() => {
    if (adminRoute) return "adminLogin";
    const saved = localStorage.getItem(PAGE_STORAGE_KEY);
    return saved || "home";
  });
  const [zoom, setZoom] = useState(1);
  const [userName, setUserName] = useState("");
  const [authReady, setAuthReady] = useState(false);

  // Guarda a página atual para restaurá-la quando a página for recarregada.
  useEffect(() => {
    if (adminRoute) return; // o fluxo do /adm não usa a página lembrada
    localStorage.setItem(PAGE_STORAGE_KEY, page);
  }, [page, adminRoute]);

  // Ao abrir ou recarregar, o Firebase avisa se já existe alguém logado.
  // Se existir, restauramos o nome e mantemos a pessoa no painel.
  useEffect(() => {
    const unsubscribe = watchAuth((user) => {
      // No /adm quem decide é a sessão do ADMINISTRADOR (AdminLogin),
      // então aqui não redirecionamos nada.
      if (adminRoute) {
        setAuthReady(true);
        return;
      }
      if (user) {
        setUserName(user.displayName || user.email?.split("@")[0] || "");
        setPage((current) =>
          PRIVATE_PAGES.includes(current) ? current : "dashboard"
        );
      } else {
        setUserName("");
        setPage((current) =>
          PRIVATE_PAGES.includes(current) ? "home" : current
        );
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, [adminRoute]);

  const increaseZoom = () =>
    setZoom((z) => Math.min(2, Math.round((z + 0.1) * 10) / 10));
  const decreaseZoom = () =>
    setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10));

  // Espera o Firebase responder antes de mostrar a tela, evitando
  // "piscar" a página inicial para quem já está logado.
  if (!authReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#383939" }}
      >
        <span style={{ color: "#AEE637", fontSize: "0.9rem" }}>Carregando…</span>
      </div>
    );
  }

  let content;
  if (page === "login") {
    content = (
      <LoginPage
        onBack={() => setPage("home")}
        onRegister={() => setPage("register")}
        onLoginSuccess={(name) => {
          setUserName(name || "");
          setPage("dashboard");
        }}
      />
    );
  } else if (page === "register") {
    content = (
      <RegisterPage
        onBackToHome={() => setPage("home")}
        onGoToLogin={() => setPage("login")}
        onRegisterSuccess={(name) => {
          setUserName(name || "");
          setPage("dashboard");
        }}
      />
    );
  } else if (page === "dashboard") {
    content = (
      <Dashboard
        userName={userName}
        onLogout={() => {
          logoutUser().catch(() => {});
          setUserName("");
          setPage("home");
        }}
        onDonate={() => setPage("donate")}
      />
    );
  } else if (page === "donate") {
    content = <DonatePage onBack={() => setPage("dashboard")} />;
  } else if (page === "adminLogin") {
    content = (
      <AdminLogin
        onAdminSuccess={() => setPage("admin")}
        onExit={() => window.location.assign("/")}
      />
    );
  } else if (page === "admin") {
    content = (
      <AdminReview
        onBack={() => {
          // "Voltar" sai do painel e encerra a sessão do administrador.
          logoutAdmin().catch(() => {});
          setPage("adminLogin");
        }}
      />
    );
  } else {
    content = (
      <App
        onLogin={() => setPage("login")}
        onRegister={() => setPage("register")}
      />
    );
  }

  return (
    <>
      <div style={{ zoom }}>
        {content}
      </div>

      {/* Controles de zoom global — afetam todas as páginas */}
      <div
        className="fixed bottom-4 right-4 flex items-center gap-1 rounded-full shadow-lg px-2 py-1.5"
        style={{ backgroundColor: "#383939", zIndex: 50 }}
      >
        <button
          onClick={decreaseZoom}
          className="p-2 rounded-full transition-colors hover:bg-white/10"
          style={{ color: "#38C958" }}
          aria-label="Diminuir zoom"
        >
          <ZoomOut size={18} />
        </button>
        <span
          className="text-xs font-semibold w-12 text-center"
          style={{ color: "#FFFEDB" }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={increaseZoom}
          className="p-2 rounded-full transition-colors hover:bg-white/10"
          style={{ color: "#38C958" }}
          aria-label="Aumentar zoom"
        >
          <ZoomIn size={18} />
        </button>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  React.createElement(Main)
);
