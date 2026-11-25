import {
  Heart,
  CheckCircle,
  ArrowRight,
  Users,
  User,
  Recycle,
  Camera,
  ClipboardCheck,
} from "lucide-react";

type AppProps = {
  onLogin: () => void;
  onRegister?: () => void;
};

// Passos do fluxo real da plataforma (cadastro → doação → análise).
const STEPS = [
  {
    icon: <User size={17} />,
    title: "Crie sua conta",
    desc: "Cadastro gratuito em poucos minutos, com seus dados protegidos.",
    accent: "#AEE637",
  },
  {
    icon: <Camera size={17} />,
    title: "Cadastre sua doação",
    desc: "Conte o que vai doar, adicione uma foto e envie pelo site.",
    accent: "#38C958",
  },
  {
    icon: <ClipboardCheck size={17} />,
    title: "Aguarde a análise",
    desc: "Nosso time revisa o envio e libera a doação para a entrega.",
    accent: "#FFFEDB",
  },
];

// Motivos para doar — ligados às categorias reais do site.
const REASONS = [
  {
    icon: <Heart size={24} className="text-[#149C68]" />,
    title: "Ajude quem mais precisa",
    desc: "Sua doação chega a famílias em situação de vulnerabilidade e vira roupa, alimento e dignidade no dia a dia de quem precisa.",
    accent: "#149C68",
  },
  {
    icon: <Recycle size={24} className="text-[#38C958]" />,
    title: "Dê uma nova vida ao que não usa",
    desc: "Roupas, móveis, livros e eletrônicos em bom estado deixam de ficar parados em casa e viram oportunidade para outra pessoa.",
    accent: "#38C958",
  },
  {
    icon: <Users size={24} className="text-[#AEE637]" />,
    title: "Fortaleça a sua comunidade",
    desc: "Cada item doado aproxima vizinhos e fortalece as redes de apoio da sua cidade, uma entrega de cada vez.",
    accent: "#AEE637",
  },
];

export default function App({ onLogin, onRegister }: AppProps) {
  const goToRegister = onRegister || onLogin;

  // Rolagem suave até uma seção da própria página inicial.
  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Cabeçalho do site */}
      <header
        className="sticky top-0 z-40 w-full border-b border-border"
        style={{
          backgroundColor: "rgba(255,254,219,0.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-full bg-[#149C68] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <Heart size={16} fill="white" className="text-white" />
            </div>
            <span
              className="text-lg font-bold text-[#383939]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Doe Fácil
            </span>
          </button>

          <nav className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => scrollTo("como-funciona")}
              className="hidden sm:inline-block px-3 py-2 text-sm font-medium text-[#5a6060] hover:text-[#0E7A50] transition-colors"
            >
              Como funciona
            </button>
            <button
              onClick={() => scrollTo("por-que-doar")}
              className="hidden md:inline-block px-3 py-2 text-sm font-medium text-[#5a6060] hover:text-[#0E7A50] transition-colors"
            >
              Por que doar
            </button>
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-semibold text-[#0E7A50] hover:bg-[#149C68]/10 rounded-full transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={goToRegister}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0E7A50] hover:bg-[#149C68] rounded-full transition-colors shadow-sm"
            >
              Criar conta
            </button>
          </nav>
        </div>
      </header>

      <main>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 70% 30%, rgba(20,156,104,0.10), transparent 60%), radial-gradient(ellipse 50% 50% at 10% 80%, rgba(174,230,55,0.12), transparent 55%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#0E7A50] mb-5 px-3 py-1.5 rounded-full"
            style={{ letterSpacing: "0.14em", backgroundColor: "rgba(20,156,104,0.10)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#149C68]" />
            Plataforma de Doações
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-[#383939] mb-6"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Bem-vindo ao{" "}
            <span className="text-[#149C68]">coração</span>{" "}
            da doação
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
            Cada doação é um ato de amor que transforma vidas. Junte-se à nossa
            comunidade de doadores e faça a diferença hoje.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0E7A50] text-white font-semibold hover:bg-[#149C68] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Quero ser doador
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => scrollTo("como-funciona")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-[#383939]/15 text-[#383939] font-medium hover:border-[#149C68] hover:text-[#0E7A50] hover:bg-white/60 transition-all duration-200"
            >
              Saiba mais
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#149C68]" />
              <span>Cadastro gratuito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-[#149C68]" />
              <span>Acompanhamento da doação</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-[#149C68]/5 blur-2xl pointer-events-none"
              aria-hidden="true"
            />
            <div
              id="como-funciona"
              className="relative rounded-3xl bg-[#383939] p-8 text-white shadow-2xl scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-[#149C68] flex items-center justify-center shadow-lg shadow-[#149C68]/30">
                  <Heart size={18} fill="white" />
                </div>
                <div>
                  <p className="text-xs text-white/65 uppercase tracking-wide">
                    Como funciona
                  </p>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Em 3 passos
                  </p>
                </div>
              </div>
              <div className="h-px bg-white/10 mb-6" />

              <ol className="space-y-5">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-3.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: step.accent + "22",
                        color: step.accent,
                      }}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        <span
                          className="mr-1.5"
                          style={{
                            color: step.accent,
                            fontFamily: "'Fraunces', serif",
                          }}
                        >
                          {index + 1}.
                        </span>
                        {step.title}
                      </p>
                      <p className="text-xs text-white/60 leading-relaxed mt-1">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-2xl bg-white/[0.06] p-4 border border-white/10">
                <p className="text-xs text-white/60 mb-1">Depois da aprovação</p>
                <p className="text-sm font-medium">
                  Você tem{" "}
                  <span className="text-[#AEE637] font-semibold">3 dias úteis</span> para
                  fazer a entrega.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#AEE637] text-[#383939] rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2">
              <CheckCircle size={14} />
              <span className="text-xs font-bold">100% seguro e gratuito</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-border" />
      </div>

      <section id="por-que-doar" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-20">
        <div className="mb-14 max-w-2xl">
          <span
            className="text-xs font-semibold tracking-widest uppercase text-[#0E7A50]"
            style={{ letterSpacing: "0.18em" }}
          >
            Por que doar?
          </span>
          <h2
            className="text-3xl lg:text-4xl font-bold text-[#383939] mt-3 leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Pequenas doações, grandes transformações
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Um gesto simples pode mudar o dia — e a história — de outra pessoa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {REASONS.map((card) => (
            <div
              key={card.title}
              className="rounded-3xl bg-card border border-border p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ backgroundColor: card.accent + "1A" }}
              >
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-[#383939] mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {card.desc}
              </p>
              <button
                onClick={onLogin}
                className="mt-6 text-sm font-semibold inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200"
                style={{ color: "#0E7A50" }}
              >
                Quero doar <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section
        id="participar"
        className="max-w-6xl mx-auto px-6 mb-20 scroll-mt-20"
      >
        <div
          className="relative rounded-[2rem] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #383939 0%, #2f4a3d 55%, #1f5a42 100%)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background:
                "radial-gradient(circle at 85% 20%, rgba(174,230,55,0.25), transparent 35%), radial-gradient(circle at 15% 80%, rgba(56,201,88,0.18), transparent 30%)",
            }}
          />
          <div className="relative px-8 py-14 md:px-12 md:py-16 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Users size={18} className="text-[#AEE637]" />
                <span
                  className="text-xs font-semibold tracking-widest uppercase text-[#AEE637]"
                  style={{ letterSpacing: "0.15em" }}
                >
                  Comunidade
                </span>
              </div>
              <h2
                className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Faça parte de algo{" "}
                <span className="text-[#AEE637]">maior</span> que você
              </h2>
              <p className="text-white/70 leading-relaxed max-w-xl">
                O Doe Fácil conecta quem tem para doar a quem precisa. Cada item
                que você envia passa por uma análise e chega a pessoas reais da
                sua cidade.
              </p>
            </div>
            <div className="shrink-0">
              <button
                onClick={onLogin}
                className="flex items-center gap-3 px-8 py-4 rounded-full bg-[#AEE637] hover:bg-[#c5f05a] text-[#383939] font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Heart size={20} fill="#383939" />
                Quero ser doador
              </button>
            </div>
          </div>
        </div>
      </section>

      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#149C68] flex items-center justify-center">
              <Heart size={12} fill="white" className="text-white" />
            </div>
            <span
              className="text-sm font-bold text-[#383939]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Doe Fácil
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 · Todos os direitos reservados · Feito com amor pelo Brasil
          </p>
        </div>
      </footer>
    </div>
  );
}
