// Serviço de doações (Firestore).
// A coleção "donations" guarda as doações enviadas pelo site.
//
// Formato de cada doação salva no banco:
// {
//   title: string,          -> nome do item
//   category: string,       -> categoria (Roupas, Alimentos, ...)
//   condition: string,      -> condição do item
//   quantity: number,       -> quantidade de itens
//   city: string,           -> cidade/UF
//   phone: string,          -> telefone para contato
//   description: string,    -> descrição escrita pelo doador
//   photo: string | null,   -> foto em base64 (JPEG já comprimido)
//   authorId: string,       -> uid de quem enviou
//   donorName: string,      -> nome de quem enviou
//   status: string,         -> "pending" | "approved" | "rejected"
//   createdAt: Timestamp    -> data/hora do servidor (serverTimestamp)
// }

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const donationsCollection = collection(db, "donations");

/** Traduz os erros do Firestore/Authentication para uma mensagem amigável. */
export function translateDonationError(error) {
  const code = error?.code || "";

  if (code.includes("permission-denied") || code.includes("not-signed-in")) {
    return "Você precisa estar logado para cadastrar uma doação.";
  }
  if (code.includes("unavailable") || code.includes("deadline")) {
    return "Sem conexão com o banco de dados. Verifique sua internet e tente novamente.";
  }
  if (code.includes("resource-exhausted")) {
    return "A foto é muito grande para ser salva. Tente escolher outra imagem.";
  }
  if (code.includes("not-found")) {
    return "Esta doação não existe mais no banco de dados.";
  }
  return "Não foi possível salvar a doação. Tente novamente.";
}

/** Mensagem específica para quem tenta administrar sem ter permissão. */
export function translateAdminError(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) {
    return "Seu usuário não tem permissão de administrador. Confira se a conta foi criada também no projeto principal e se existe um documento em 'admins' com o e-mail dela.";
  }
  return translateDonationError(error);
}

/**
 * Escuta as doações FEITAS PELO USUÁRIO LOGADO, em tempo real
 * (da mais nova para a mais antiga).
 * @param {(donations: Array<Record<string, any>>) => void} onData
 * @param {(error: unknown) => void} [onError]
 * @returns {import("firebase/firestore").Unsubscribe}
 */
export function watchMyDonations(onData, onError) {
  const uid = auth.currentUser?.uid || null;
  const q = query(donationsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const all = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      }));
      // Filtra no navegador para não precisar de índice composto no banco.
      onData(uid ? all.filter((item) => item.authorId === uid) : []);
    },
    onError
  );
}

/**
 * Salva uma nova doação no banco, assinando com o usuário logado.
 * Toda doação nasce com status "pending" (aguardando análise).
 * @param {{
 *   title: string,
 *   category: string,
 *   condition: string,
 *   quantity: number,
 *   city: string,
 *   phone: string,
 *   description: string,
 *   photo?: string | null,
 * }} data
 * @returns {Promise<import("firebase/firestore").DocumentReference>}
 */
export function addDonation(data) {
  const user = auth.currentUser;
  if (!user) {
    const error = new Error("auth/not-signed-in");
    error.code = "auth/not-signed-in";
    return Promise.reject(error);
  }

  const quantity = Number.isFinite(Number(data.quantity))
    ? Math.max(1, Math.round(Number(data.quantity)))
    : 1;

  return addDoc(donationsCollection, {
    title: String(data.title || "").trim(),
    category: String(data.category || "").trim(),
    condition: String(data.condition || "").trim(),
    quantity,
    city: String(data.city || "").trim(),
    phone: String(data.phone || "").trim(),
    description: String(data.description || "").trim(),
    // undefined não é aceito pelo Firestore, por isso usamos null.
    photo: data.photo || null,
    authorId: user.uid,
    donorName: user.displayName || user.email?.split("@")[0] || "Doador",
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
//  Funções do PAINEL DO ADMINISTRADOR
// ---------------------------------------------------------------------------

/**
 * Escuta TODAS as doações em tempo real, para o painel do administrador.
 * Assim, assim que alguém cadastra uma doação, ela aparece na tela do Adm.
 * @param {(donations: Array<Record<string, any>>) => void} onData
 * @param {(error: unknown) => void} [onError]
 * @returns {import("firebase/firestore").Unsubscribe}
 */
export function watchAllDonations(onData, onError) {
  const q = query(donationsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...docSnapshot.data(),
      })));
    },
    onError
  );
}

/**
 * Aprova ou rejeita uma doação. As regras do Firestore permitem que apenas
 * administradores alterem o campo "status".
 * @param {string} donationId
 * @param {"approved" | "rejected"} status
 * @returns {Promise<void>}
 */
export function setDonationStatus(donationId, status) {
  if (!auth.currentUser) {
    const error = new Error("auth/not-signed-in");
    error.code = "auth/not-signed-in";
    return Promise.reject(error);
  }

  return updateDoc(doc(db, "donations", donationId), { status }).catch(
    (error) => {
      const wrapped = new Error(error?.message || "update-falhou");
      wrapped.code = error?.code || "unknown";
      throw wrapped;
    }
  );
}
