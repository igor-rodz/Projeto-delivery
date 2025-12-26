# 🏁 PitStop Delivery

Plataforma SaaS completa para restaurantes criarem seu cardápio digital e receberem pedidos online.

![PitStop Delivery](public/hero.png)

## 🚀 Tecnologias

- **Frontend:** Next.js 15 (App Router)
- **Estilização:** TailwindCSS 4 + Shadcn/UI
- **Database e Auth:** Supabase
- **Linguagem:** TypeScript

## ☁️ Deploy Instantâneo

Você pode fazer o deploy desse projeto na Vercel com um clique:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Figor-rodz%2FProjeto-delivery&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=pitstop-delivery&repository-name=pitstop-delivery)

**Variáveis de Ambiente Necessárias:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🛠️ Rodando Localmente

1. Clone o projeto:
```bash
git clone https://github.com/igor-rodz/Projeto-delivery.git
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Rode o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
