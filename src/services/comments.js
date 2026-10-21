// Serviço de comentários (Firestore).
// A coleção "comments" guarda os comentários da comunidade.
//
// Formato de cada comentário salvo no banco:
// {
//   text: string,        -> o texto do comentário
//   authorId: string,    -> uid do usuário logado (vem do Authentication)
//   authorName: string,  -> nome de exibição do usuário
//   createdAt: Timestamp -> data/hora do servidor (serverTimestamp)
// }

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const commentsCollection = collection(db, "comments");

/**
 * Escuta os comentários em tempo real (do mais novo para o mais antigo).
 * Sempre que alguém comenta, a lista é atualizada automaticamente.
 * @param {(comments: Array<{id: string, author: string, text: string, createdAt: unknown}>) => void} onData
 * @param {(error: unknown) => void} [onError]
 * @returns {import("firebase/firestore").Unsubscribe}
 */
export function watchComments(onData, onError) {
  const q = query(commentsCollection, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          author: data.authorName || "Doador",
          text: data.text || "",
          createdAt: data.createdAt,
        };
      });
      onData(comments);
    },
    onError
  );
}

/**
 * Salva um novo comentário no banco, assinando com o usuário logado.
 * @param {string} text
 * @returns {Promise<import("firebase/firestore").DocumentReference>}
 */
export function addComment(text) {
  const user = auth.currentUser;
  if (!user) {
    return Promise.reject(new Error("auth/not-signed-in"));
  }

  return addDoc(commentsCollection, {
    text: text.trim(),
    authorId: user.uid,
    authorName: user.displayName || user.email?.split("@")[0] || "Doador",
    createdAt: serverTimestamp(),
  });
}
