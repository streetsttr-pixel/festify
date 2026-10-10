# ☁️ Colocando o Festify online (Supabase + site + APK)

Sem isso o app funciona em **modo demonstração**: cada aparelho tem seus próprios dados.
Com o Supabase, todo mundo vê os mesmos temas, convites e confirmações. Leva uns 15 minutos e é grátis.

---

## Parte 1 — Criar o banco de dados (Supabase)

1. Acesse **supabase.com** → **Start your project** → entre com sua conta do GitHub.
2. **New project**
   - Name: `festify`
   - Database Password: crie uma senha forte e guarde
   - Region: **South America (São Paulo)**
   - Clique em **Create new project** e espere ~2 minutos.
3. No menu da esquerda, abra **SQL Editor** → **New query**.
4. Abra o arquivo `supabase/schema.sql` do projeto, copie **tudo**, cole no editor e clique em **Run**.
   Deve aparecer *"Success. No rows returned"*.

## Parte 2 — Criar o seu login de administrador

1. Menu **Authentication** → **Users** → **Add user** → **Create new user**.
2. Coloque seu e-mail e uma senha, marque **Auto Confirm User** e clique em **Create user**.
3. Volte ao **SQL Editor** → **New query**, cole a linha abaixo trocando pelo **seu e-mail** e clique em **Run**:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'seu-email@exemplo.com'
on conflict do nothing;
```

4. (Segurança extra) **Authentication** → **Sign In / Providers** → desligue **Allow new users to sign up** → **Save**.
   Assim ninguém consegue criar conta sozinho.

## Parte 3 — Pegar as chaves

1. Clique em **Project Settings** (engrenagem) → **Data API** e copie a **Project URL**
   (algo como `https://abcdefgh.supabase.co`).
2. Em **API Keys**, copie a chave **publishable** (começa com `sb_publishable_`) — ou a chave **anon public** se aparecer a aba "Legacy".
   ⚠️ Nunca use a chave `secret` / `service_role`.

## Parte 4 — Ligar tudo no GitHub

1. No seu repositório: **Settings** → **Secrets and variables** → **Actions** → aba **Variables** → **New repository variable**:
   - Name: `SUPABASE_URL` → Value: a Project URL
   - Name: `SUPABASE_KEY` → Value: a chave publishable/anon
2. Ainda em **Settings** → **Pages** → em **Source** escolha **GitHub Actions**.
   *(No plano grátis do GitHub, o repositório precisa ser **público** para o site funcionar.)*
3. Aba **Actions** → **Gerar APK Android** → **Run workflow** (ou envie qualquer arquivo novo).
4. Quando ficar ✅:
   - **Site (biblioteca de temas):** `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`
   - **APK:** aba **Releases** → `Festify.apk` (instale a versão nova por cima da antiga)

## Parte 5 — Primeiro acesso

1. Abra o site → role até o fim → **Área do buffet** (ou abra o app) → entre com e-mail e senha.
2. **Ajustes:** nome do buffet, logo, **WhatsApp** (para onde vão os pedidos) e endereço.
3. **Biblioteca → Adicionar tema:** fotos, nome, menina/menino/para todos, palavras-chave e estilo do convite.
4. Divulgue o link do site. Quando um cliente pedir pelo WhatsApp, abra o link do tema que vem na mensagem →
   **Gerar convite online** → preencha → envie o link do convite e o **link privado da lista** para o cliente.

---

### Dúvidas comuns

- **"Sem permissão. Entre como administrador."** → faltou a Parte 2, passo 3 (o e-mail precisa estar na tabela `admins`).
- **O site abre em modo demonstração** → as variáveis `SUPABASE_URL`/`SUPABASE_KEY` não foram criadas ou o build não rodou de novo.
- **Quero usar outro endereço (domínio próprio)** → crie a variável `PUBLIC_URL` com o endereço completo, terminando em `/`.
- **Sem GitHub Actions?** Dá para editar `public/config.js` direto (supabaseUrl, supabaseKey, publicUrl).
