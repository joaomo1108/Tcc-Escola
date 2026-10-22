import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Package,
  Tag,
  ClipboardList,
  MapPin,
  Phone,
  Calendar,
  User,
  Inbox,
  ChevronRight,
  X,
} from "lucide-react";
import {
  watchAllDonations,
  setDonationStatus,
  translateAdminError,
} from "../services/donations";

type DonationSubmission = {
  id: string;
  donorName?: string;
  photo?: string | null;
  title?: string;
  category?: string;
  condition?: string;
  quantity?: number;
  city?: string;
  phone?: string;
  description?: string;
  status?: string; // "pending" | "approved" | "rejected"
  createdAt?: { toDate?: () => Date } | string | number | null;
};

/** "pending" = ainda precisa de análise. Todo o resto está concluída. */
type Aba = "pending" | "done";

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando análise",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  pending: { backgroundColor: "rgba(174,230,55,0.35)", color: "#4a5d0f" },
  approved: { backgroundColor: "rgba(20,156,104,0.15)", color: "#0B5D3E" },
  rejected: { backgroundColor: "rgba(212,24,61,0.12)", color: "#B00E31" },
};

type AdminReviewProps = {
  onBack: () => void;
};

/** Converte o Timestamp do Firestore em "12/10/2026". */
function formatarData(value: DonationSubmission["createdAt"]) {
  if (!value) return "—";
  const date =
    typeof (value as { toDate?: () => Date }).toDate === "function"
      ? (value as { toDate: () => Date }).toDate()
      : new Date(value as string | number);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b" style={{ borderColor: "rgba(56,57,57,0.1)" }}>
      <div className="mt-0.5" style={{ color: "#149C68" }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "#5a6060" }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: "#383939" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Ficha completa de uma doação: título, foto e todos os dados informados
 * pelo doador. Usada tanto na aba de análise quanto no modal das concluídas.
 */
function FichaDaDoacao({ doacao }: { doacao: DonationSubmission }) {
  const status = doacao.status || "pending";
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "#383939", fontFamily: "'Fraunces', serif" }}
          >
            {doacao.title || "Doação"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "#5a6060" }}>
            Enviada por <span className="font-semibold">{doacao.donorName || "Doador"}</span>
            {formatarData(doacao.createdAt) !== "—" && <> em {formatarData(doacao.createdAt)}</>}
          </p>
        </div>
        <span
          className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
          style={STATUS_STYLES[status] || STATUS_STYLES.pending}
        >
          {STATUS_LABELS[status] || STATUS_LABELS.pending}
        </span>
      </div>

      {/* Foto da doação */}
      <div
        className="w-full h-64 rounded-2xl flex flex-col items-center justify-center mb-6 border-2 border-dashed overflow-hidden"
        style={{ borderColor: "rgba(56,57,57,0.2)", backgroundColor: "#f7faf0" }}
      >
        {doacao.photo ? (
          // object-contain mostra a foto INTEIRA, do jeito que o doador
          // ajustou — sem cortar as bordas (que é o que o object-cover fazia).
          <img
            src={doacao.photo}
            alt={`Foto de ${doacao.title || "doação"}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <>
            <ImageIcon size={40} style={{ color: "#149C68" }} />
            <span className="text-sm mt-2" style={{ color: "#5a6060" }}>
              Esta doação foi enviada sem foto
            </span>
          </>
        )}
      </div>

      {/* Tudo que foi escrito sobre a doação */}
      <div>
        <DetailRow icon={<User size={16} />} label="Doador" value={doacao.donorName || "—"} />
        <DetailRow icon={<Tag size={16} />} label="Categoria" value={doacao.category || "—"} />
        <DetailRow icon={<ClipboardList size={16} />} label="Condição" value={doacao.condition || "—"} />
        <DetailRow icon={<Calendar size={16} />} label="Quantidade" value={doacao.quantity ?? "—"} />
        <DetailRow icon={<MapPin size={16} />} label="Cidade / UF" value={doacao.city || "—"} />
        <DetailRow icon={<Phone size={16} />} label="Telefone" value={doacao.phone || "—"} />
        <div className="flex items-start gap-3 py-2.5">
          <div className="mt-0.5" style={{ color: "#149C68" }}>
            <Package size={16} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: "#5a6060" }}>
              Descrição
            </p>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "#383939" }}>
              {doacao.description || "—"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminReview({ onBack }: AdminReviewProps) {
  const [submissions, setSubmissions] = useState<DonationSubmission[]>([]);
  const [aba, setAba] = useState<Aba>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ tipo: string; texto: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // As doações chegam em tempo real: assim que um doador envia,
  // ela aparece aqui na hora.
  useEffect(() => {
    const unsubscribe = watchAllDonations(
      (list) => {
        setSubmissions(list as DonationSubmission[]);
        setLoading(false);
      },
      (error) => {
        setLoadError(translateAdminError(error));
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const pendentes = submissions.filter((s) => (s.status || "pending") === "pending");
  const concluidas = submissions.filter((s) => (s.status || "pending") !== "pending");
  const lista = aba === "pending" ? pendentes : concluidas;

  // Mantém sempre uma doação selecionada dentro da aba aberta.
  useEffect(() => {
    if (!selectedId || !lista.some((s) => s.id === selectedId)) {
      setSelectedId(lista[0]?.id ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, submissions, selectedId]);

  const selected = lista.find((s) => s.id === selectedId) || null;
  const aberta = concluidas.find((s) => s.id === abertaId) || null;

  const handleDecision = async (decision: "approved" | "rejected") => {
    if (!selected || saving) return;

    const previous = selected.status || "pending";
    setSaving(true);
    setDecisionError(null);

    // Atualização otimista: mostra na tela já, e desfaz se o banco recusar.
    setSubmissions((prev) =>
      prev.map((s) => (s.id === selected.id ? { ...s, status: decision } : s))
    );

    try {
      await setDonationStatus(selected.id, decision);

      setAviso({
        tipo: decision,
        texto:
          decision === "approved"
            ? `“${selected.title || "Doação"}” foi aprovada e saiu da fila de análise. O doador vê no painel dele: “Obrigado pela doação, agora você tem um prazo de 3 dias úteis para fazer a entrega.”`
            : `“${selected.title || "Doação"}” foi rejeitada e saiu da fila de análise. O status já apareceu para o doador.`,
      });

      // Mostra onde a doação parou: já abre a aba de concluídas com ela marcada.
      setAba("done");
      setSelectedId(selected.id);
    } catch (error) {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selected.id ? { ...s, status: previous } : s))
      );
      setDecisionError(translateAdminError(error));
    } finally {
      setSaving(false);
    }
  };

  const abas: { chave: Aba; rotulo: string; total: number }[] = [
    { chave: "pending", rotulo: "Pendentes", total: pendentes.length },
    { chave: "done", rotulo: "Doações concluídas", total: concluidas.length },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFEDB" }}>
      <header
        className="w-full px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#383939" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#149C68" }}
          >
            <ShieldCheck size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#FFFEDB" }}>
            Painel do Administrador
          </span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "#38C958" }}
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Sair do painel</span>
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div
          className="rounded-2xl px-5 py-3 mb-6 flex items-center gap-2 text-sm"
          style={{ backgroundColor: "#AEE63722", color: "#149C68" }}
        >
          <ShieldCheck size={16} />
          <span>
            Conectado ao banco de dados — as doações chegam em tempo real.
            {pendentes.length > 0
              ? ` ${pendentes.length} aguardando análise.`
              : " Nenhuma pendente."}
          </span>
        </div>

        {loading && (
          <p className="text-sm mb-6" style={{ color: "#5a6060" }}>
            Carregando doações…
          </p>
        )}

        {loadError && (
          <div
            className="rounded-2xl px-5 py-4 mb-6 text-sm"
            style={{
              backgroundColor: "rgba(212,24,61,0.1)",
              color: "#d4183d",
              border: "1px solid rgba(212,24,61,0.35)",
            }}
          >
            {loadError}
          </div>
        )}

        {!loading && !loadError && submissions.length === 0 && (
          <div
            className="rounded-3xl p-10 border text-center bg-white"
            style={{ borderColor: "rgba(56,57,57,0.1)" }}
          >
            <Inbox size={40} className="mx-auto mb-3" style={{ color: "#149C68" }} />
            <p className="text-sm" style={{ color: "#5a6060" }}>
              Nenhuma doação recebida ainda. Assim que alguém cadastrar no site,
              ela aparece aqui automaticamente.
            </p>
          </div>
        )}

        {submissions.length > 0 && (
          <>
            {/* Abas: análise x concluídas */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {abas.map((t) => {
                const ativa = aba === t.chave;
                return (
                  <button
                    key={t.chave}
                    onClick={() => {
                      setAba(t.chave);
                      setDecisionError(null);
                    }}
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2"
                    style={
                      ativa
                        ? { backgroundColor: "#0E7A50", color: "#FFFEDB" }
                        : {
                            backgroundColor: "#ffffff",
                            color: "#5a6060",
                            border: "1px solid rgba(56,57,57,0.14)",
                          }
                    }
                  >
                    {t.rotulo}
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={
                        ativa
                          ? { backgroundColor: "rgba(255,254,187,0.25)" }
                          : { backgroundColor: "rgba(56,57,57,0.07)" }
                      }
                    >
                      {t.total}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Aviso de o que aconteceu com a última doação decidida */}
            {aviso && (
              <div
                className="rounded-2xl px-5 py-3 mb-6 flex items-start gap-3 text-sm"
                style={
                  aviso.tipo === "approved"
                    ? {
                        backgroundColor: "rgba(14,122,80,0.1)",
                        color: "#0B5D3E",
                        border: "1px solid rgba(14,122,80,0.3)",
                      }
                    : {
                        backgroundColor: "rgba(212,24,61,0.1)",
                        color: "#B00E31",
                        border: "1px solid rgba(212,24,61,0.3)",
                      }
                }
              >
                {aviso.tipo === "approved" ? (
                  <CheckCircle size={16} className="mt-0.5 shrink-0" />
                ) : (
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                )}
                <span className="flex-1">{aviso.texto}</span>
                <button
                  onClick={() => setAviso(null)}
                  aria-label="Fechar aviso"
                  className="shrink-0 opacity-70 hover:opacity-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* ---------------- ABA PENDENTES: análise completa ---------------- */}
            {aba === "pending" &&
              (pendentes.length === 0 ? (
                <div
                  className="rounded-3xl p-10 border text-center bg-white"
                  style={{ borderColor: "rgba(56,57,57,0.1)" }}
                >
                  <CheckCircle size={40} className="mx-auto mb-3" style={{ color: "#0E7A50" }} />
                  <p className="text-sm" style={{ color: "#5a6060" }}>
                    Nenhuma doação aguardando análise. Tudo em dia!
                  </p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-[320px_1fr] gap-6">
                  {/* Lista de doações pendentes */}
                  <aside className="space-y-3">
                    <h2
                      className="text-sm font-semibold uppercase tracking-wide mb-1"
                      style={{ color: "#5a6060" }}
                    >
                      Aguardando análise ({pendentes.length})
                    </h2>
                    {pendentes.map((s) => {
                      const isSelected = s.id === selectedId;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedId(s.id)}
                          className="w-full text-left rounded-2xl p-4 border transition-all"
                          style={{
                            backgroundColor: isSelected ? "#0E7A50" : "#ffffff",
                            borderColor: isSelected ? "#0E7A50" : "rgba(56,57,57,0.1)",
                            color: isSelected ? "#FFFEDB" : "#383939",
                          }}
                        >
                          <p className="text-sm font-bold mb-1">{s.title || "Doação"}</p>
                          <p className="text-xs" style={{ color: isSelected ? "#FFFEDB" : "#5a6060" }}>
                            {s.donorName || "Doador"} · {s.city || "—"}
                          </p>
                          <p
                            className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                            style={
                              isSelected
                                ? { backgroundColor: "rgba(255,254,187,0.2)", color: "#FFFEDB" }
                                : STATUS_STYLES.pending
                            }
                          >
                            {STATUS_LABELS.pending}
                          </p>
                        </button>
                      );
                    })}
                  </aside>

                  {/* Detalhe da doação selecionada */}
                  <section
                    className="rounded-3xl p-6 md:p-8 border bg-white"
                    style={{ borderColor: "rgba(56,57,57,0.1)" }}
                  >
                    {selected ? (
                      <>
                        <FichaDaDoacao doacao={selected} />

                        {/* Review: aprovar ou rejeitar a doação */}
                        <div
                          className="rounded-2xl p-4 border"
                          style={{ backgroundColor: "#f7faf0", borderColor: "rgba(56,57,57,0.1)" }}
                        >
                          <p className="text-sm font-semibold mb-3" style={{ color: "#383939" }}>
                            Review da iniciativa de doação
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={() => handleDecision("approved")}
                              disabled={saving || (selected.status || "pending") === "approved"}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                              style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
                            >
                              <CheckCircle size={18} />
                              {saving ? "Salvando..." : "Aprovar doação"}
                            </button>
                            <button
                              onClick={() => handleDecision("rejected")}
                              disabled={saving || (selected.status || "pending") === "rejected"}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                              style={{ backgroundColor: "#B00E31", color: "#FFFEDB" }}
                            >
                              <XCircle size={18} />
                              {saving ? "Salvando..." : "Rejeitar doação"}
                            </button>
                          </div>

                          {decisionError && (
                            <p className="text-sm mt-3" style={{ color: "#B00E31" }}>
                              {decisionError}
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm" style={{ color: "#5a6060" }}>
                        Selecione uma doação na lista ao lado.
                      </p>
                    )}
                  </section>
                </div>
              ))}

            {/* -------- ABA CONCLUÍDAS: lista curta, ficha ao clicar -------- */}
            {aba === "done" &&
              (concluidas.length === 0 ? (
                <div
                  className="rounded-3xl p-10 border text-center bg-white"
                  style={{ borderColor: "rgba(56,57,57,0.1)" }}
                >
                  <Inbox size={40} className="mx-auto mb-3" style={{ color: "#149C68" }} />
                  <p className="text-sm" style={{ color: "#5a6060" }}>
                    Nenhuma doação concluída ainda. Assim que você aprovar ou
                    rejeitar uma doação, ela aparece aqui.
                  </p>
                </div>
              ) : (
                <>
                  <h2
                    className="text-sm font-semibold uppercase tracking-wide mb-3"
                    style={{ color: "#5a6060" }}
                  >
                    Concluídas ({concluidas.length}) — clique para ver a ficha completa
                  </h2>
                  <div className="space-y-2">
                    {concluidas.map((s) => {
                      const status = s.status || "pending";
                      return (
                        <button
                          key={s.id}
                          onClick={() => setAbertaId(s.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl border bg-white text-left transition-all hover:shadow-md"
                          style={{ borderColor: "rgba(56,57,57,0.1)" }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ backgroundColor: "#f7faf0" }}
                          >
                            {s.photo ? (
                              <img src={s.photo} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Package size={18} style={{ color: "#149C68" }} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate" style={{ color: "#383939" }}>
                              {s.title || "Doação"}
                            </p>
                            <p className="text-xs truncate" style={{ color: "#5a6060" }}>
                              {s.donorName || "Doador"} · {s.city || "—"} · {formatarData(s.createdAt)}
                            </p>
                          </div>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={STATUS_STYLES[status] || STATUS_STYLES.pending}
                          >
                            {STATUS_LABELS[status] || STATUS_LABELS.pending}
                          </span>
                          <ChevronRight size={16} className="shrink-0" style={{ color: "#5a6060" }} />
                        </button>
                      );
                    })}
                  </div>
                </>
              ))}
          </>
        )}
      </div>

      {/* Modal com a ficha completa da doação concluída */}
      {aberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(56,57,57,0.55)" }}
          onClick={() => setAbertaId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Ficha da doação ${aberta.title || ""}`}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-2xl max-h-[86vh] overflow-y-auto rounded-3xl p-6 md:p-8"
            style={{ backgroundColor: "#FFFEDB" }}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#5a6060" }}
              >
                Doação concluída
              </p>
              <button
                onClick={() => setAbertaId(null)}
                aria-label="Fechar ficha"
                className="p-1 rounded-full transition-colors hover:bg-black/5"
              >
                <X size={18} style={{ color: "#383939" }} />
              </button>
            </div>
            <FichaDaDoacao doacao={aberta} />
          </div>
        </div>
      )}
    </div>
  );
}
