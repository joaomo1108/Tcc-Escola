// Inicialização do Firebase do ADMINISTRADOR.
//
// Este é um SEGUNDO projeto Firebase (doe-facil-adm), separado
// do site normal (doe-facil-5c2a0). Ele só existe para guardar
// as contas de administrador — quem faz login aqui tem acesso
// à tela /adm.
//
// Por isso o initializeApp recebe o nome "admin": ele cria uma
// segunda instância do app, sem conflitar com a primeira.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseAdminConfig } from "./firebaseAdminConfig";

export const adminApp = initializeApp(firebaseAdminConfig, "admin");

// Autenticação do projeto de administrador.
export const adminAuth = getAuth(adminApp);
