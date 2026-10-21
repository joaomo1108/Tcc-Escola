import { useEffect, useState } from "react";
import {
  Heart,
  LogOut,
  MessageCircle,
  Send,
  User,
  Package,
  MapPin,
} from "lucide-react";
import { addComment, watchComments } from "../services/comments";
import { watchMyDonations } from "../services/donations";

type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: unknown;
};

type Donation = {
  id: string;
  title?: string;
  category?: string;
  condition?: string;
  quantity?: number;
  city?: string;
  description?: string;
  photo?: string | null;
  status?: string;
  createdAt?: unknown;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando análise",
  approved: "Aprovada",
  rejected: "Rejeitada",
};

const STATUS_STYLES: Record<string, { backgroundColor: string; color: string }> = {
  pending: { backgroundColor: "rgba(174,230,55,0.35)", color: "#4a5d0f" },
  approved: { backgroundColor: "rgba(20,156,104,0.15)", color: "#149C68" },
  rejected: { backgroundColor: "rgba(212,24,61,0.12)", color: "#d4183d" },
};

// Transforma a data do banco (Timestamp) em um texto amigável.
function formatRelativeTime(createdAt: any): string {
  if (!createdAt) return "Agora mesmo";
  const date =
    typeof createdAt?.toDate === "function" ? createdAt.toDate() : new Date(createdAt);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMinutes < 1) return "Agora mesmo";
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Ontem";
  if (days < 7) return `Há ${days} dias`;
  return date.toLocaleDateString("pt-BR");
}

type DashboardProps = {
  onLogout: () => void;
  onDonate: () => void;
  userName?: string;
};

export default function Dashboard({ onLogout, onDonate, userName }: DashboardProps) {
  const displayName = userName && userName.trim() ? userName.trim() : "Doador";
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [myDonations, setMyDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [donationsError, setDonationsError] = useState<string | null>(null);

  // Carrega as doações do próprio usuário, em tempo real.
  useEffect(() => {
    const unsubscribe = watchMyDonations(
      (list) => {
        setMyDonations(list as Donation[]);
        setLoadingDonations(false);
      },
      () => {
        setDonationsError("Não foi possível carregar suas doações.");
        setLoadingDonations(false);
      }
    );
    return unsubscribe;
  }, []);

  // Carrega os comentários do banco e mantém a lista atualizada em tempo real.
  useEffect(() => {
    const unsubscribe = watchComments(
      (list) => {
        setComments(list as Comment[]);
        setLoadingComments(false);
      },
      () => {
        setCommentError("Não foi possível carregar os comentários.");
        setLoadingComments(false);
      }
    );
    return unsubscribe;
  }, []);

  const handlePostComment = async () => {
    const text = commentText.trim();
    if (!text || posting) return;

    setPosting(true);
    setCommentError(null);
    try {
      await addComment(text);
      setCommentText("");
    } catch (error) {
      setCommentError("Não foi possível enviar seu comentário. Tente novamente.");
    } finally {
      setPosting(false);
    }
  };

  // Quantos dias fazem desde a primeira doação cadastrada.
  const oldest = myDonations[myDonations.length - 1];
  const daysAsDonor = oldest
    ? Math.max(
        1,
        Math.ceil(
          (Date.now() - new Date((oldest.createdAt as any)?.toDate?.() ?? Date.now()).getTime()) /
            86400000
        )
      )
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFEDB" }}>
      {/* Header */}
      <header
        className="w-full px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: "#383939" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#149C68" }}
          >
            <Heart size={16} fill="white" className="text-white" />
          </div>
          <span
            className="text-sm font-bold"
            style={{ color: "#FFFEDB", fontFamily: "'Fraunces', serif" }}
          >
            Doe Fácil
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#AEE637" }}
            >
              <User size={16} style={{ color: "#383939" }} />
            </div>
            <span className="text-sm font-medium" style={{ color: "#FFFEDB" }}>
              {displayName}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "#38C958" }}
          >
            <LogOut size={16} />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero do painel */}
        <div
          className="rounded-3xl p-8 md:p-10 mb-8"
          style={{
            background: "linear-gradient(135deg, #383939 0%, #149C68 100%)",
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: "#FFFEDB", fontFamily: "'Fraunces', serif" }}
              >
                Bem-vindo, <span style={{ color: "#AEE637" }}>{displayName}</span>
              </h1>
              <p style={{ color: "#38C958", opacity: 0.9 }}>
                Sua generosidade transforma vidas. Que tal fazer uma doação hoje?
              </p>
            </div>
            <button
              onClick={onDonate}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "#AEE637",
                color: "#383939",
              }}
            >
              <Heart size={20} fill="currentColor" />
              Fazer doação
            </button>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Doações realizadas", value: String(myDonations.length), accent: "#149C68" },
            {
              label: "Vidas impactadas",
              value: String(
                myDonations
                  .filter((d) => d.status === "approved")
                  .reduce((sum, d) => sum + (Number(d.quantity) || 0), 0)
              ),
              accent: "#38C958",
            },
            { label: "Dias como doador", value: String(daysAsDonor), accent: "#AEE637" },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(56,57,57,0.1)",
              }}
            >
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#5a6060" }}
              >
                {card.label}
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: card.accent, fontFamily: "'Fraunces', serif" }}
              >
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Minhas doações (salvas no Firestore) */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Package size={20} style={{ color: "#149C68" }} />
            <h2
              className="text-xl font-bold"
              style={{ color: "#383939", fontFamily: "'Fraunces', serif" }}
            >
              Minhas doações
            </h2>
          </div>

          {loadingDonations && (
            <p className="text-sm" style={{ color: "#5a6060" }}>
              Carregando suas doações…
            </p>
          )}

          {donationsError && (
            <p className="text-sm" style={{ color: "#d4183d" }}>
              {donationsError}
            </p>
          )}

          {!loadingDonations && !donationsError && myDonations.length === 0 && (
            <div
              className="rounded-2xl p-6 border text-center"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(56,57,57,0.1)",
              }}
            >
              <p className="text-sm mb-3" style={{ color: "#5a6060" }}>
                Você ainda não cadastrou nenhuma doação.
              </p>
              <button
                onClick={onDonate}
                className="px-5 py-2.5 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
              >
                Fazer minha primeira doação
              </button>
            </div>
          )}

          {myDonations.length > 0 && (
            <div className="space-y-4">
              {myDonations.map((donation) => {
                const status = donation.status || "pending";
                return (
                  <div
                    key={donation.id}
                    className="rounded-2xl p-5 border flex gap-4"
                    style={{
                      backgroundColor: "#ffffff",
                      borderColor: "rgba(56,57,57,0.1)",
                    }}
                  >
                    {/* Miniatura da foto */}
                    <div
                      className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: "#f7faf0" }}
                    >
                      {donation.photo ? (
                        <img
                          src={donation.photo}
                          alt={donation.title || "Doação"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={22} style={{ color: "#149C68" }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold truncate"
                            style={{ color: "#383939" }}
                          >
                            {donation.title || "Doação"}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#5a6060" }}
                          >
                            {donation.category}
                            {donation.quantity ? ` · ${donation.quantity} item(ns)` : ""}
                          </p>
                        </div>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={STATUS_STYLES[status] || STATUS_STYLES.pending}
                        >
                          {STATUS_LABELS[status] || STATUS_LABELS.pending}
                        </span>
                      </div>

                      <p
                        className="text-xs mt-2 flex items-center gap-1"
                        style={{ color: "#5a6060" }}
                      >
                        <MapPin size={12} />
                        {donation.city}
                        <span style={{ opacity: 0.6 }}>
                          · {formatRelativeTime(donation.createdAt)}
                        </span>
                      </p>

                      {/* Mensagem exibida assim que o administrador aprova */}
                      {status === "approved" && (
                        <div
                          className="mt-3 rounded-xl px-3.5 py-2.5 text-xs leading-relaxed flex items-start gap-2"
                          style={{
                            backgroundColor: "rgba(20,156,104,0.1)",
                            color: "#149C68",
                            border: "1px solid rgba(20,156,104,0.25)",
                          }}
                        >
                          <Heart
                            size={14}
                            fill="currentColor"
                            className="flex-shrink-0 mt-0.5"
                          />
                          <span>
                            Obrigado pela doação, agora você tem um prazo de 3
                            dias úteis para fazer a entrega.
                          </span>
                        </div>
                      )}

                      {status === "rejected" && (
                        <p
                          className="mt-3 text-xs leading-relaxed"
                          style={{ color: "#d4183d" }}
                        >
                          Esta doação não foi aprovada pelo administrador. Se
                          preferir, cadastre novamente com outras informações.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comunidade - Comentários */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle size={20} style={{ color: "#149C68" }} />
            <h2
              className="text-xl font-bold"
              style={{ color: "#383939", fontFamily: "'Fraunces', serif" }}
            >
              Comunidade
            </h2>
          </div>

          {/* Form de novo comentário */}
          <div
            className="rounded-2xl p-5 mb-6 border"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "rgba(56,57,57,0.1)",
            }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: "#AEE637", color: "#383939" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm" style={{ color: "#5a6060" }}>
                Comentando como{" "}
                <strong style={{ color: "#383939" }}>{displayName}</strong>
              </span>
            </div>
            <div className="flex gap-3">
              <textarea
                placeholder="Compartilhe sua experiência..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border outline-none transition-all resize-none"
                style={{
                  backgroundColor: "#f7faf0",
                  borderColor: "rgba(56,57,57,0.15)",
                  color: "#383939",
                  minHeight: "80px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(56,57,57,0.15)")
                }
              />
              <button
                onClick={handlePostComment}
                disabled={posting || !commentText.trim()}
                className="px-4 rounded-xl transition-all hover:opacity-90 active:scale-95 flex items-center justify-center disabled:opacity-50"
                style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
              >
                <Send size={18} />
              </button>
            </div>
            {commentError && (
              <p className="text-sm mt-2" style={{ color: "#d4183d" }}>
                {commentError}
              </p>
            )}
          </div>

          {/* Lista de comentários */}
          <div className="space-y-4">
            {loadingComments && (
              <p className="text-sm" style={{ color: "#5a6060" }}>
                Carregando comentários…
              </p>
            )}

            {!loadingComments && comments.length === 0 && (
              <p className="text-sm" style={{ color: "#5a6060" }}>
                Ainda não há comentários. Seja o primeiro a compartilhar!
              </p>
            )}

            {comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl p-5 border"
                style={{
                  backgroundColor: "#ffffff",
                  borderColor: "rgba(56,57,57,0.1)",
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ backgroundColor: "#38C958", color: "#383939" }}
                  >
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "#383939" }}
                    >
                      {comment.author}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "#5a6060" }}
                    >
                      {formatRelativeTime(comment.createdAt)}
                    </p>
                  </div>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5a6060" }}
                >
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
