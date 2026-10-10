# 🎉 Festify — Biblioteca de Temas + Convites Interativos com RSVP em Tempo Real

Sistema para buffets infantis: o cliente escolhe o tema numa vitrine online, pede o convite pelo WhatsApp,
e o buffet gera o convite digital animado com confirmação de presença em tempo real.

## Como funciona

| Quem | Onde | O que faz |
|---|---|---|
| **Cliente** | `/` | Biblioteca de temas com busca (ex.: “dinossauro”) e filtro **Menina / Menino** |
| **Cliente** | `?tema=slug` | Fotos do tema (galeria com zoom), miniatura e demonstração animada do convite, botão **Pedir convite online** → WhatsApp do buffet com *“Amei esse tema: X, vou querer ele!!…”* |
| **Admin** | `?admin=1` (ou o APK) | Login · **Convites** · **Biblioteca** (adicionar/editar temas e fotos) · **Ajustes** (nome, logo, WhatsApp, endereço) |
| **Admin** | página do tema | Botão exclusivo **Gerar convite online** → foto da biblioteca **ou** do celular (fica só no convite) |
| **Convidado** | `?festa=slug` | Envelope animado (GSAP), contagem regressiva, Como Chegar, Pix, RSVP com confetes |
| **Cliente (pai/mãe)** | `?lista=token` | Lista **privada** de confirmados da festa dele, atualizada sozinha, com PDF/WhatsApp |

## Rodar no computador

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # site estático em /dist
npm run build:single # um único festify.html que abre com duplo clique
```

Sem configuração, roda em **modo demonstração** (localStorage) com 10 temas e uma festa de exemplo.

## Colocar online

1. **Supabase** (banco, login, fotos): siga o [GUIA-SUPABASE.md](GUIA-SUPABASE.md) — inclui `supabase/schema.sql`
   com permissões (RLS): público só lê temas e confirma presença; convites e listas só para o admin;
   o cliente vê a própria lista pelo token secreto.
2. **GitHub Actions** (`.github/workflows/build-apk.yml`): publica o site no **GitHub Pages** e gera o **APK**
   (Releases) a cada envio — veja o [GUIA-APK.md](GUIA-APK.md).

Configuração em tempo de execução: `public/config.js` (`supabaseUrl`, `supabaseKey`, `publicUrl`) ou variáveis
do repositório `SUPABASE_URL`, `SUPABASE_KEY`, `PUBLIC_URL` (injetadas pelo `scripts/configure.cjs`).

## Estrutura

```
src/
├── App.jsx                # Rotas por query string (funciona em hospedagem estática e no APK)
├── library/               # Biblioteca pública, página do tema, galeria, demonstração
├── host/                  # Painel admin: login, convites, biblioteca, editor de tema, ajustes, RSVP
├── guest/                 # Convite do convidado (envelope GSAP, contador, Pix, RSVP)
├── client/                # Lista privada do cliente
├── services/              # repository → localAdapter (demo) | supabaseAdapter (online) + seed
├── hooks/                 # useThemes, useSettings, useAuth, useRsvps (tempo real), useRoute...
└── lib/                   # temas visuais, config, utils, exportação PDF/WhatsApp, integração nativa
supabase/schema.sql        # Tabelas, funções e permissões
assets/                    # Ícone e splash do app Android (@capacitor/assets)
```

## Windows (.exe)

`desktop/` é um app Electron que empacota o mesmo site (protocolo `app://`, links externos no navegador padrão).
O GitHub Actions gera o `Festify-Setup.exe` (NSIS) em Releases. Local: copie `dist/` para `desktop/web` e rode
`npm install && npm run dist:win` dentro de `desktop/`.

O site também é instalável como app (PWA) no Chrome/Edge e no iPhone (Adicionar à Tela de Início).

## APK local (opcional, com Android Studio + JDK 21)

```bash
npm run build && npm run cap:init && npx cap sync android && npx cap open android
```
