# Doe Fácil

Plataforma de doações de itens — site onde qualquer pessoa cadastra uma doação (com foto),
um administrador analisa e aprova/rejeita, e o doador acompanha o status pelo painel.

Trabalho de Conclusão de Curso (TCC).

---

## Como funciona

1. **Doador** cria a conta e cadastra a doação: nome do item, categoria, condição,
   quantidade, cidade/UF, telefone, descrição e uma foto.
2. A doação entra na fila com o status **Aguardando análise**.
3. O **administrador** abre a área restrita, confere os dados e a foto, e decide:
   **Aprovar** ou **Rejeitar**.
4. O **doador** vê o resultado no próprio painel em tempo real. Se aprovada, aparece
   a orientação: *"Obrigado pela doação, agora você tem um prazo de 3 dias úteis
   para fazer a entrega."*

### Área do administrador

Não existe botão de administração no site público. A área é acessada **apenas digitando
`/adm` na barra de endereços**.

O painel tem duas abas:

- **Pendentes** — fila de análise, com a ficha completa da doação e os botões de decisão.
- **Doações concluídas** — lista compacta (miniatura, título, doador, cidade e data).
  Clicando em uma linha, abre a ficha completa.

## Tecnologias

- **React 18** + **Vite**
- **Tailwind CSS** (compilado localmente pelo PostCSS — não usa CDN)
- **Firebase Authentication** (login por e-mail e senha) e **Cloud Firestore** (banco)
- **lucide-react** (ícones)

## Estrutura

```
src/
  app/          telas (App = início, Login, Register, Dashboard, Donate, AdminLogin, AdminReview)
  lib/          inicialização do Firebase (projeto principal e projeto de administradores)
  services/     regras de negócio (auth, doações, autenticação do administrador)
  styles/       Tailwind, fontes e variáveis de tema
public/         favicon e robots.txt
```

## Segurança

O projeto usa **dois projetos Firebase separados**:

| Projeto | Papel |
| --- | --- |
| `doe-facil-5c2a0` | Site e banco de doações |
| `doe-facil-adm` | Portaria do painel: só contas de administrador existem aqui |

Para abrir o painel, o login precisa dar certo **nos dois** projetos com o mesmo e-mail e a
mesma senha. As regras do Firestore liberam a alteração do status de uma doação somente para
quem tiver uma sessão no projeto principal **e** um documento na coleção `admins` cujo
identificador seja o e-mail da conta.

As chaves de configuração do Firebase visíveis no código são públicas por natureza — a
proteção real está nas regras do Firestore.

## Rodando o projeto

Pré-requisito: **Node.js 18 ou superior**.

```bash
npm install     # instala as dependências
npm run dev     # ambiente de desenvolvimento (http://localhost:5173)
npm run build   # gera a versão de produção na pasta dist
```
