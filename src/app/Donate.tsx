import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  CheckCircle,
  Heart,
  Package,
  Tag,
  ClipboardList,
  MapPin,
  Phone,
  Calendar,
  ImagePlus,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Trash2,
} from "lucide-react";
import { addDonation, translateDonationError } from "../services/donations";

const CATEGORIES = [
  "Roupas",
  "Calçados",
  "Alimentos",
  "Brinquedos",
  "Eletrônicos",
  "Móveis",
  "Livros",
  "Higiene e Cuidados",
  "Outros",
];

const CONDITIONS = [
  "Novo",
  "Como novo",
  "Usado em bom estado",
  "Usado",
  "Precisa de reparos",
];

type FormData = {
  title: string;
  category: string;
  condition: string;
  quantity: number;
  city: string;
  phone: string;
  description: string;
};

// O Firestore aceita no máximo 1 MB por documento. Uma foto de celular
// passa fácil disso, então redimensionamos e comprimimos para JPEG.
// Retorna null se mesmo assim ficar grande demais (a foto é opcional).
function compressPhoto(
  dataUrl: string,
  options: { zoom: number; rotation: number; flipX: boolean; flipY: boolean }
): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = 1000;
      const zoom = options.zoom || 1;
      const rotation = options.rotation || 0;
      const rad = (rotation * Math.PI) / 180;
      const flipX = options.flipX ? -1 : 1;
      const flipY = options.flipY ? -1 : 1;

      // Dimensões que a imagem ocupa DEPOIS de girar e aplicar o zoom.
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));
      const rotW = img.width * cos + img.height * sin;
      const rotH = img.width * sin + img.height * cos;
      const scale = Math.min(1, maxSide / Math.max(rotW * zoom, rotH * zoom));

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(rotW * zoom * scale));
      canvas.height = Math.max(1, Math.round(rotH * zoom * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Pinta o fundo de branco: com o zoom/rotação pode sobrar canto vazio.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(flipX * zoom * scale, flipY * zoom * scale);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const result = canvas.toDataURL("image/jpeg", 0.7);
      resolve(result.length < 900_000 ? result : null);
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

type DonateProps = {
  onBack: () => void;
};

export default function DonatePage({ onBack }: DonateProps) {
  const [submitted, setSubmitted] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Ajustes que o doador faz na foto antes de enviar.
  const [ajustes, setAjustes] = useState({
    zoom: 1,
    rotation: 0,
    flipX: false,
    flipY: false,
  });
  const [editandoFoto, setEditandoFoto] = useState(false);

  const alterarAjuste = (campo: string, valor: number | boolean) =>
    setAjustes((atual) => ({ ...atual, [campo]: valor }));

  /** Volta a foto ao estado original (sem zoom, giro ou espelhamento). */
  const restaurarFoto = () =>
    setAjustes({ zoom: 1, rotation: 0, flipX: false, flipY: false });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setSubmitError(null);
    try {
      const savedPhoto = photo
        ? await compressPhoto(photo, ajustes)
        : null;
      await addDonation({
        title: data.title,
        category: data.category,
        condition: data.condition,
        quantity: data.quantity,
        city: data.city,
        phone: data.phone,
        description: data.description,
        photo: savedPhoto,
      });
      setSubmitted(true);
    } catch (error) {
      setSubmitError(translateDonationError(error));
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#FFFEDB" }}>
        <div className="w-full max-w-md rounded-3xl p-8 text-center shadow-2xl bg-white">
          <div
            className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#149C68" }}
          >
            <CheckCircle size={32} style={{ color: "#FFFEDB" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#383939", fontFamily: "'Fraunces', serif" }}>
            Doação cadastrada!
          </h1>
          <p className="text-sm mb-7" style={{ color: "#5a6060" }}>
            Sua doação foi registrada e está aguardando análise. Você pode
            acompanhar o status dela na seção <strong>Minhas doações</strong> do
            seu painel.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
          >
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFEDB" }}>
      <header className="w-full px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#383939" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: "#149C68" }}>
            <Heart size={16} fill="white" className="text-white" />
          </div>
          <span
            className="text-sm font-bold"
            style={{ color: "#FFFEDB", fontFamily: "'Fraunces', serif" }}
          >
            Doe Fácil
          </span>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: "#38C958" }}
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Voltar</span>
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <span
            className="text-xs font-semibold tracking-widest uppercase mb-2 inline-block"
            style={{ color: "#149C68", letterSpacing: "0.15em" }}
          >
            Nova doação
          </span>
          <h1 className="text-3xl font-bold" style={{ color: "#383939", fontFamily: "'Fraunces', serif" }}>
            Compartilhe sua doação
          </h1>
          <p className="text-sm mt-2" style={{ color: "#5a6060" }}>
            Preencha os dados abaixo. Quanto mais detalhes, mais fácil encontrar quem precisa.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-3xl p-6 md:p-8 border space-y-5 bg-white"
          style={{ borderColor: "rgba(56,57,57,0.1)" }}
        >
          {/* Foto */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
              Foto do item <span style={{ color: "#5a6060", fontWeight: 400 }}>(opcional)</span>
            </label>

            {photo ? (
              <div className="space-y-3">
                {/* Área de visualização da foto escolhida */}
                <div
                  className="relative w-full rounded-2xl border-2 overflow-hidden flex items-center justify-center"
                  style={{ height: editandoFoto ? "18rem" : "9rem", borderColor: "#149C68", backgroundColor: "#f7faf0" }}
                >
                  <img
                    src={photo}
                    alt="Pré-visualização da doação"
                    className="max-w-full max-h-full transition-transform duration-150"
                    style={{
                      objectFit: "contain",
                      transform: `scale(${ajustes.zoom}) rotate(${ajustes.rotation}deg) scaleX(${ajustes.flipX ? -1 : 1}) scaleY(${ajustes.flipY ? -1 : 1})`,
                    }}
                  />
                </div>

                {/* Controles do editor */}
                {editandoFoto && (
                  <div
                    className="rounded-2xl p-4 space-y-4 border"
                    style={{ backgroundColor: "#f7faf0", borderColor: "rgba(56,57,57,0.1)" }}
                  >
                    {/* Zoom */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "#383939" }}>
                          <Maximize2 size={13} style={{ color: "#149C68" }} />
                          Tamanho da imagem
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "#0E7A50" }}>
                          {Math.round(ajustes.zoom * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => alterarAjuste("zoom", Math.max(0.3, Math.round((ajustes.zoom - 0.1) * 10) / 10))}
                          className="p-2 rounded-lg border bg-white transition-colors hover:bg-[#149C68]/10"
                          style={{ borderColor: "rgba(56,57,57,0.15)" }}
                          aria-label="Diminuir imagem"
                        >
                          <ZoomOut size={15} style={{ color: "#383939" }} />
                        </button>
                        <input
                          type="range"
                          min="0.3"
                          max="3"
                          step="0.05"
                          value={ajustes.zoom}
                          onChange={(e) => alterarAjuste("zoom", Number(e.target.value))}
                          className="flex-1 accent-[#149C68]"
                          aria-label="Tamanho da imagem"
                        />
                        <button
                          type="button"
                          onClick={() => alterarAjuste("zoom", Math.min(3, Math.round((ajustes.zoom + 0.1) * 10) / 10))}
                          className="p-2 rounded-lg border bg-white transition-colors hover:bg-[#149C68]/10"
                          style={{ borderColor: "rgba(56,57,57,0.15)" }}
                          aria-label="Aumentar imagem"
                        >
                          <ZoomIn size={15} style={{ color: "#383939" }} />
                        </button>
                      </div>
                    </div>

                    {/* Girar e espelhar */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => alterarAjuste("rotation", ajustes.rotation - 90)}
                        className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border bg-white text-xs font-semibold transition-colors hover:bg-[#149C68]/10"
                        style={{ borderColor: "rgba(56,57,57,0.15)", color: "#383939" }}
                      >
                        <RotateCcw size={14} style={{ color: "#149C68" }} />
                        Girar esquerda
                      </button>
                      <button
                        type="button"
                        onClick={() => alterarAjuste("rotation", ajustes.rotation + 90)}
                        className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border bg-white text-xs font-semibold transition-colors hover:bg-[#149C68]/10"
                        style={{ borderColor: "rgba(56,57,57,0.15)", color: "#383939" }}
                      >
                        <RotateCw size={14} style={{ color: "#149C68" }} />
                        Girar direita
                      </button>
                      <button
                        type="button"
                        onClick={() => alterarAjuste("flipX", !ajustes.flipX)}
                        className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors"
                        style={{
                          borderColor: ajustes.flipX ? "#149C68" : "rgba(56,57,57,0.15)",
                          backgroundColor: ajustes.flipX ? "rgba(20,156,104,0.1)" : "#ffffff",
                          color: "#383939",
                        }}
                      >
                        <FlipHorizontal size={14} style={{ color: "#149C68" }} />
                        Espelhar
                      </button>
                      <button
                        type="button"
                        onClick={() => alterarAjuste("flipY", !ajustes.flipY)}
                        className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors"
                        style={{
                          borderColor: ajustes.flipY ? "#149C68" : "rgba(56,57,57,0.15)",
                          backgroundColor: ajustes.flipY ? "rgba(20,156,104,0.1)" : "#ffffff",
                          color: "#383939",
                        }}
                      >
                        <FlipVertical size={14} style={{ color: "#149C68" }} />
                        Virar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 border-t" style={{ borderColor: "rgba(56,57,57,0.1)" }}>
                      <button
                        type="button"
                        onClick={restaurarFoto}
                        className="flex-1 min-w-[7rem] px-3 py-2 rounded-lg border bg-white text-xs font-semibold transition-colors hover:bg-[#149C68]/10"
                        style={{ borderColor: "rgba(56,57,57,0.15)", color: "#383939" }}
                      >
                        Restaurar original
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhoto(null);
                          restaurarFoto();
                          setEditandoFoto(false);
                        }}
                        className="flex-1 min-w-[7rem] flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border bg-white text-xs font-semibold transition-colors hover:bg-[#d4183d]/10"
                        style={{ borderColor: "rgba(212,24,61,0.4)", color: "#B00E31" }}
                      >
                        <Trash2 size={13} />
                        Remover foto
                      </button>
                    </div>
                  </div>
                )}

                {/* Ações rápidas abaixo da foto */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditandoFoto((v) => !v)}
                    className="flex-1 min-w-[8rem] px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                    style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
                  >
                    {editandoFoto ? "Concluir ajustes" : "Ajustar imagem"}
                  </button>
                  <label
                    className="flex-1 min-w-[8rem] px-3 py-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-colors hover:bg-[#149C68]/10"
                    style={{ borderColor: "rgba(56,57,57,0.15)", color: "#383939" }}
                  >
                    Trocar foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setPhoto(ev.target?.result as string);
                          restaurarFoto();
                        };
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label
                className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-colors"
                style={{ borderColor: "rgba(56,57,57,0.2)", backgroundColor: "#f7faf0" }}
              >
                <div className="text-center">
                  <ImagePlus size={28} className="mx-auto mb-2" style={{ color: "#149C68" }} />
                  <span className="text-sm" style={{ color: "#5a6060" }}>
                    Clique para escolher uma foto
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setPhoto(ev.target?.result as string);
                      restaurarFoto();
                      setEditandoFoto(true);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          {/* Título */}
          <div>
            <label htmlFor="title" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
              <Package size={14} style={{ color: "#149C68" }} />
              Nome do item
            </label>
            <input
              id="title"
              type="text"
              placeholder="Ex.: Casaco de lã infantil"
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
              style={{
                backgroundColor: "#f7faf0",
                borderColor: errors.title ? "#d4183d" : "rgba(56,57,57,0.15)",
                color: "#383939",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#149C68")}
              onBlur={(e) => (e.target.style.borderColor = errors.title ? "#d4183d" : "rgba(56,57,57,0.15)")}
              {...register("title", { required: "Informe o nome do item" })}
            />
            {errors.title && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.title.message}</p>}
          </div>

          {/* Categoria e condição */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
                <Tag size={14} style={{ color: "#149C68" }} />
                Categoria
              </label>
              <select
                id="category"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{
                  backgroundColor: "#f7faf0",
                  borderColor: errors.category ? "#d4183d" : "rgba(56,57,57,0.15)",
                  color: "#383939",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                onBlur={(e) => (e.target.style.borderColor = errors.category ? "#d4183d" : "rgba(56,57,57,0.15)")}
                defaultValue=""
                {...register("category", { required: "Escolha uma categoria" })}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.category.message}</p>}
            </div>

            <div>
              <label htmlFor="condition" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
                <ClipboardList size={14} style={{ color: "#149C68" }} />
                Condição
              </label>
              <select
                id="condition"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{
                  backgroundColor: "#f7faf0",
                  borderColor: errors.condition ? "#d4183d" : "rgba(56,57,57,0.15)",
                  color: "#383939",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                onBlur={(e) => (e.target.style.borderColor = errors.condition ? "#d4183d" : "rgba(56,57,57,0.15)")}
                defaultValue=""
                {...register("condition", { required: "Escolha a condição" })}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.condition && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.condition.message}</p>}
            </div>
          </div>

          {/* Quantidade e cidade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
                <Calendar size={14} style={{ color: "#149C68" }} />
                Quantidade
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="Ex.: 2"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{ backgroundColor: "#f7faf0", borderColor: "rgba(56,57,57,0.15)", color: "#383939" }}
                onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(56,57,57,0.15)")}
                {...register("quantity", {
                  required: "Informe a quantidade",
                  valueAsNumber: true,
                  min: { value: 1, message: "Mínimo 1" },
                })}
              />
              {errors.quantity && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.quantity.message}</p>}
            </div>

            <div>
              <label htmlFor="city" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
                <MapPin size={14} style={{ color: "#149C68" }} />
                Cidade / UF
              </label>
              <input
                id="city"
                type="text"
                placeholder="Ex.: São Paulo, SP"
                className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
                style={{
                  backgroundColor: "#f7faf0",
                  borderColor: errors.city ? "#d4183d" : "rgba(56,57,57,0.15)",
                  color: "#383939",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                onBlur={(e) => (e.target.style.borderColor = errors.city ? "#d4183d" : "rgba(56,57,57,0.15)")}
                {...register("city", { required: "Informe a cidade" })}
              />
              {errors.city && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.city.message}</p>}
            </div>
          </div>

          {/* Contato */}
          <div>
            <label htmlFor="phone" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
              <Phone size={14} style={{ color: "#149C68" }} />
              Telefone para contato
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="(11) 90000-0000"
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all"
              style={{
                backgroundColor: "#f7faf0",
                borderColor: errors.phone ? "#d4183d" : "rgba(56,57,57,0.15)",
                color: "#383939",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#149C68")}
              onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#d4183d" : "rgba(56,57,57,0.15)")}
              {...register("phone", { required: "Informe um telefone de contato" })}
            />
            {errors.phone && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.phone.message}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="flex items-center gap-1.5 block mb-2 text-sm font-medium" style={{ color: "#383939" }}>
              <ClipboardList size={14} style={{ color: "#149C68" }} />
              Descrição
            </label>
            <textarea
              id="description"
              placeholder="Descreva o item, tamanho, características, etc."
              className="w-full px-4 py-3 rounded-xl border outline-none transition-all resize-none"
              style={{
                backgroundColor: "#f7faf0",
                borderColor: errors.description ? "#d4183d" : "rgba(56,57,57,0.15)",
                color: "#383939",
                minHeight: "110px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#149C68")}
              onBlur={(e) => (e.target.style.borderColor = errors.description ? "#d4183d" : "rgba(56,57,57,0.15)")}
              {...register("description", { required: "Descreva o item" })}
            />
            {errors.description && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.description.message}</p>}
          </div>

          {submitError && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{
                backgroundColor: "rgba(212,24,61,0.1)",
                color: "#d4183d",
                border: "1px solid rgba(212,24,61,0.35)",
              }}
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-bold text-lg shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
          >
            {isSubmitting ? "Salvando doação..." : "Cadastrar doação"}
          </button>
        </form>
      </div>
    </div>
  );
}
