// Serviço de autenticação (Firebase Authentication).
// Centraliza as operações de conta para as telas não falarem
// diretamente com o SDK do Firebase.

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../lib/firebase";

/**
 * Cria uma conta com e-mail e senha e define o nome de exibição.
 * @param {{ name: string, email: string, password: string }} dados
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function registerUser({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }
  return credential;
}

/**
 * Entra com e-mail e senha.
 * @param {{ email: string, password: string }} dados
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export function loginUser({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Sai da conta atual. */
export function logoutUser() {
  return signOut(auth);
}

/**
 * Envia por e-mail o link de redefinição de senha.
 * @param {string} email
 * @returns {Promise<void>}
 */
export function sendPasswordReset(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Observa mudanças no estado de login (usuário logado / deslogado).
 * @param {(user: import("firebase/auth").User | null) => void} callback
 * @returns {import("firebase/auth").Unsubscribe}
 */
export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// Mensagens de erro do Firebase traduzidas para o usuário final.
const AUTH_ERROR_MESSAGES = {
  "auth/email-already-in-use": "Este e-mail já está cadastrado.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/weak-password": "A senha é muito fraca. Use pelo menos 6 caracteres.",
  "auth/missing-password": "Informe uma senha.",
  "auth/missing-email": "Informe o seu e-mail.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/too-many-requests": "Muitas tentativas. Tente novamente em instantes.",
  "auth/network-request-failed": "Falha de conexão. Verifique sua internet.",
  "auth/invalid-api-key":
    "Configuração do Firebase ausente ou inválida. Preencha o arquivo firebaseConfig.js.",
  "auth/configuration-not-found":
    "O provedor de E-mail/Senha não está ativado no console do Firebase.",
  "auth/operation-not-allowed":
    "O login por e-mail e senha está desativado no console do Firebase. Ative em Authentication → Sign-in method → Email/Password.",
  "auth/unsupported-identity-provider":
    "Este provedor de login está desativado no console do Firebase.",
  "auth/user-disabled": "Esta conta foi desativada.",
  "auth/requires-recent-login":
    "Por segurança, faça login novamente para continuar.",
};

/**
 * Traduz um erro do Firebase Auth para uma mensagem amigável em português.
 * @param {unknown} error
 * @returns {string}
 */
export function translateAuthError(error) {
  const code = error && typeof error === "object" ? error.code : undefined;
  if (code && AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  return "Não foi possível concluir a operação. Tente novamente.";
}
