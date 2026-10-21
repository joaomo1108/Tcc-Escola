import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, ArrowLeft } from "lucide-react";
import { registerUser, translateAuthError } from "../services/auth";

type FormData = {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  password: string;
  confirm_password: string;
  terms: boolean;
};

type RegisterProps = {
  onBackToHome: () => void;
  onGoToLogin: () => void;
  onRegisterSuccess: (name: string) => void;
};

export default function RegisterPage({ onBackToHome, onGoToLogin, onRegisterSuccess }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      onRegisterSuccess(data.name);
    } catch (error) {
      setServerError(translateAuthError(error));
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #383939 0%, #149C68 100%)" }}
    >
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: "600px" }}>

        <div
          className="hidden md:flex flex-col justify-between p-10 w-2/5"
          style={{ backgroundColor: "#383939" }}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10"
              style={{ backgroundColor: "#149C68" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#AEE637" }} />
              <span style={{ color: "#FFFEDB", fontSize: "0.8rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                DOE FÁCIL
              </span>
            </div>

            <h1 style={{ color: "#FFFEDB", lineHeight: 1.2, marginBottom: "1rem" }}>
              Faça parte da nossa comunidade
            </h1>
            <p style={{ color: "#AEE637", lineHeight: 1.7, opacity: 0.9 }}>
              Crie sua conta gratuitamente e tenha acesso a todos os recursos disponíveis.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Acesso imediato após o cadastro",
              "Suporte disponível 24 horas",
              "Dados protegidos com criptografia",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#38C958" }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#FFFEDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ color: "#FFFEDB", opacity: 0.85, fontSize: "0.9rem" }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1 rounded-full flex-1"
                style={{ backgroundColor: i === 1 ? "#AEE637" : "rgba(255,254,219,0.2)" }}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 bg-[#FFFEDB] p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
          <button
            type="button"
            onClick={onBackToHome}
            className="flex items-center gap-1.5 mb-5 self-start text-sm font-medium transition-colors hover:opacity-75"
            style={{ color: "#149C68" }}
          >
            <ArrowLeft size={15} />
            Voltar para o início
          </button>

          <div className="mb-8">
            <h2 style={{ color: "#383939", marginBottom: "0.25rem" }}>Criar conta</h2>
            <p style={{ color: "#5a6060", fontSize: "0.9rem" }}>
              Preencha os campos abaixo para se cadastrar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" style={{ color: "#383939", display: "block", marginBottom: "0.4rem" }}>
                Nome completo
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#149C68" }} />
                <input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ backgroundColor: "#f7faf0", borderColor: errors.name ? "#d4183d" : "rgba(56,57,57,0.15)", color: "#383939" }}
                  onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                  onBlur={(e) => (e.target.style.borderColor = errors.name ? "#d4183d" : "rgba(56,57,57,0.15)")}
                  {...register("name", { required: "Nome é obrigatório" })}
                />
              </div>
              {errors.name && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" style={{ color: "#383939", display: "block", marginBottom: "0.4rem" }}>
                E-mail
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#149C68" }} />
                <input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                  style={{ backgroundColor: "#f7faf0", borderColor: errors.email ? "#d4183d" : "rgba(56,57,57,0.15)", color: "#383939" }}
                  onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                  onBlur={(e) => (e.target.style.borderColor = errors.email ? "#d4183d" : "rgba(56,57,57,0.15)")}
                  {...register("email", {
                    required: "E-mail é obrigatório",
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "E-mail inválido" },
                  })}
                />
              </div>
              {errors.email && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" style={{ color: "#383939", display: "block", marginBottom: "0.4rem" }}>Telefone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#149C68" }} />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(11) 90000-0000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ backgroundColor: "#f7faf0", borderColor: errors.phone ? "#d4183d" : "rgba(56,57,57,0.15)", color: "#383939" }}
                    onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                    onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#d4183d" : "rgba(56,57,57,0.15)")}
                    {...register("phone", { required: "Telefone é obrigatório" })}
                  />
                </div>
                {errors.phone && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.phone.message}</p>}
              </div>

              <div>
                <label htmlFor="birthdate" style={{ color: "#383939", display: "block", marginBottom: "0.4rem" }}>Data de nascimento</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#149C68" }} />
                  <input
                    id="birthdate"
                    type="date"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                    style={{ backgroundColor: "#f7faf0", borderColor: errors.birthdate ? "#d4183d" : "rgba(56,57,57,0.15)", color: "#383939" }}
                    onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                    onBlur={(e) => (e.target.style.borderColor = errors.birthdate ? "#d4183d" : "rgba(56,57,57,0.15)")}
                    {...register("birthdate", { required: "Data é obrigatória" })}
                  />
                </div>
                {errors.birthdate && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.birthdate.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" style={{ color: "#383939", display: "block", marginBottom: "0.4rem" }}>Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#149C68" }} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border outline-none transition-all"
                  style={{ backgroundColor: "#f7faf0", borderColor: errors.password ? "#d4183d" : "rgba(56,57,57,0.15)", color: "#383939" }}
                  onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "#d4183d" : "rgba(56,57,57,0.15)")}
                  {...register("password", {
                    required: "Senha é obrigatória",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                  })}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword((v) => !v)} style={{ color: "#5a6060" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirm_password" style={{ color: "#383939", display: "block", marginBottom: "0.4rem" }}>Confirmar senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#149C68" }} />
                <input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border outline-none transition-all"
                  style={{ backgroundColor: "#f7faf0", borderColor: errors.confirm_password ? "#d4183d" : "rgba(56,57,57,0.15)", color: "#383939" }}
                  onFocus={(e) => (e.target.style.borderColor = "#149C68")}
                  onBlur={(e) => (e.target.style.borderColor = errors.confirm_password ? "#d4183d" : "rgba(56,57,57,0.15)")}
                  {...register("confirm_password", {
                    required: "Confirmação é obrigatória",
                    validate: (v) => v === password || "As senhas não coincidem",
                  })}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowConfirm((v) => !v)} style={{ color: "#5a6060" }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.confirm_password.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  id="terms"
                  type="checkbox"
                  className="peer appearance-none w-5 h-5 rounded-md border-2 cursor-pointer transition-all"
                  style={{ borderColor: errors.terms ? "#d4183d" : "rgba(56,57,57,0.3)" }}
                  {...register("terms", { required: "Aceite os termos para continuar" })}
                />
                <svg className="absolute inset-0 w-5 h-5 pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 20 20">
                  <rect width="20" height="20" rx="6" fill="#149C68" />
                  <path d="M5 10L8.5 13.5L15 7" stroke="#FFFEDB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <label htmlFor="terms" style={{ color: "#5a6060", fontSize: "0.875rem", lineHeight: 1.5, cursor: "pointer" }}>
                Li e concordo com os{" "}
                <span style={{ color: "#149C68", textDecoration: "underline" }}>Termos de Uso</span>{" "}
                e a{" "}
                <span style={{ color: "#149C68", textDecoration: "underline" }}>Política de Privacidade</span>
              </label>
            </div>
            {errors.terms && <p style={{ color: "#d4183d", fontSize: "0.8rem", marginTop: "-0.5rem" }}>{errors.terms.message}</p>}

            {serverError && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#d4183d1a", color: "#d4183d", border: "1px solid #d4183d55" }}
              >
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-2"
              style={{ backgroundColor: "#0E7A50", color: "#FFFEDB" }}
            >
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </button>

            <p style={{ color: "#5a6060", fontSize: "0.875rem", textAlign: "center" }}>
              Já tem uma conta?{" "}
              <span
                onClick={onGoToLogin}
                style={{ color: "#149C68", cursor: "pointer", textDecoration: "underline" }}
              >
                Entrar
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
