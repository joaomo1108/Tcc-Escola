// Serviço de autenticação do ADMINISTRADOR.
//
// O painel usa o projeto Firebase separado (doe-facil-adm) como PORTARIA:
// só quem tem conta lá consegue abrir a tela /adm.
//
// Só que as doações ficam no banco do projeto PRINCIPAL (doe-facil-5c2a0).
// As regras do Firestore desse banco só aceitam quem tem uma sessão do
// projeto principal. Por isso o login do administrador abre as DUAS
// sessões ao mesmo tempo — com o mesmo e-mail e a mesma senha.

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { adminAuth } from "../lib/firebaseAdmin";
import { auth } from "../lib/firebase";
import { loginUser, logoutUser } from "./auth";

/**
 * Entra como administrador.
 * 1) Valida a conta no projeto de administradores (doe-facil-adm);
 * 2) Abre também uma sessão no projeto principal, para conseguir ler
 *    e atualizar as doações.
 * @param {{ email: string, password: string }} dados
 * @returns {Promise<void>}
 */
export async function loginAdmin({ email, password }) {
  try {
    await signInWithEmailAndPassword(adminAuth, email, password);
  } catch (error) {
    // A PORTARIA (projeto de administradores) recusou: senha errada lá,
    // ou a conta nem existe nesse projeto.
    const code = error && typeof error === "object" ? error.code : "";
    const wrapped = new Error("Falha ao entrar no projeto de administradores.");
    if (code === "auth/user-not-found") {
      wrapped.code = "admin/conta-ausente-no-projeto-adm";
    } else if (
      code === "auth/invalid-credential" ||
      code === "auth/wrong-password"
    ) {
      wrapped.code = "admin/senha-errada-no-projeto-adm";
    } else {
      wrapped.code = code || "admin/erro-desconhecido";
    }
    throw wrapped;
  }

  try {
    await loginUser({ email, password });
  } catch (error) {
    const code =
      error && typeof error === "object" && error.code ? error.code : "";

    // A portaria aceitou, mas a sessão do projeto principal falhou.
    // Desfaz o login da portaria para não deixar meio acesso aberto.
    await signOut(adminAuth).catch(() => {});

    const wrapped = new Error("Falha ao abrir a sessão no projeto principal.");
    if (code === "auth/user-not-found") {
      // Não tem conta nenhuma no projeto principal.
      wrapped.code = "admin/conta-ausente-no-projeto-principal";
    } else if (
      code === "auth/invalid-credential" ||
      code === "auth/wrong-password"
    ) {
      // A conta existe, mas a senha do projeto principal é outra.
      wrapped.code = "admin/senha-diferente-no-projeto-principal";
    } else {
      // Mantém o código original para o translateAuthError traduzir
      // (erro de internet, tentativas demais, configuração etc.).
      wrapped.code = code || "admin/erro-desconhecido";
    }
    throw wrapped;
  }
}

/** Sai do painel e encerra as duas sessões. */
export async function logoutAdmin() {
  await signOut(adminAuth).catch(() => {});
  await logoutUser().catch(() => {});
}

/** E-mail da sessão de administrador aberta neste navegador. */
export function currentAdminEmail() {
  return adminAuth.currentUser?.email || null;
}

/** E-mail da sessão aberta no projeto principal (usada pelas regras). */
export function currentMainUserEmail() {
  return auth.currentUser?.email || null;
}

/**
 * Observa a sessão do administrador (para entrar direto se já logado).
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function watchAdminSession(callback) {
  return onAuthStateChanged(adminAuth, callback);
}
