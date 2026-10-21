// Inicialização do Firebase.
//
// A configuração fica no arquivo "firebaseConfig.js" (ao lado deste).
// Cole lá o bloco "firebaseConfig" copiado do console do Firebase.
//
// Observação: a configuração web do Firebase é pública por natureza
// (ela aparece no navegador do usuário). A segurança de verdade é
// feita pelas Regras de Segurança do Firestore/Storage.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig";

export const app = initializeApp(firebaseConfig);

// Instância de autenticação usada em todo o app.
export const auth = getAuth(app);

// Instância do banco de dados (Firestore) usada em todo o app.
export const db = getFirestore(app);
