# 📱💻 Atualizar o repositório e gerar o APK + instalador do Windows

O GitHub gera **o site, o APK (Android) e o Festify-Setup.exe (Windows)** sozinho a cada envio de arquivos.

## Enviar a versão nova para o GitHub

1. Descompacte o `festify.zip` e abra a pasta **festify**.
2. No repositório do GitHub: **Add file** → **Upload files**.
3. No Windows Explorer, selecione **tudo** dentro da pasta `festify` (Ctrl+A) — arquivos **e pastas** — e
   **arraste** para a página do GitHub. *(O botão "choose your files" não aceita pastas — precisa arrastar.)*
4. Confira se na lista de envio aparecem caminhos como `src/...`, `public/...`, `assets/...`, `supabase/...`.
5. **Commit changes**.

> A pasta `android` não é mais necessária: o GitHub cria o projeto Android com o ícone do Festify sozinho.
> Se ela existir no repositório de uma versão antiga, **apague** (abra a pasta → ⋯ → Delete directory),
> senão o ícone novo não é aplicado.
>
> Se a pasta `.github` não subir (alguns PCs escondem pastas com ponto), edite o arquivo
> `.github/workflows/build-apk.yml` pelo site e cole o conteúdo novo.

## Acompanhar

Aba **Actions** → "Gerar APK Android" mostra as etapas **Site**, **Publicar site**, **APK Android**,
**Instalador Windows** e **Publicar downloads** (leva ~8–10 minutos).
- ✅ verde = pronto. **Publicar site** só funciona depois de ligar o GitHub Pages
  (Settings → Pages → Source: **GitHub Actions**) — se ainda não ligou, ela falha mas o APK sai normalmente.

## Instalar no celular

Abra no celular: `github.com/SEU-USUARIO/SEU-REPOSITORIO/releases` → toque em **Festify.apk** → instale.
Se o Android bloquear: **Configurações → Permitir desta fonte**; se o Play Protect avisar: **Instalar mesmo assim**.

## Instalar no PC (Windows)

**Opção 1 — programa (.exe):**
1. No PC, abra `github.com/SEU-USUARIO/SEU-REPOSITORIO/releases` e baixe **Festify-Setup.exe**.
2. Execute. Se aparecer *"O Windows protegeu o computador"*, clique em **Mais informações** → **Executar assim mesmo**
   (o aviso aparece porque o instalador não tem assinatura digital paga — é normal).
3. Siga o instalador. O Festify ganha atalho na **Área de Trabalho** e no **Menu Iniciar** e abre direto no painel do buffet.

**Opção 2 — instalar pelo navegador (sem baixar nada):**
abra o site no **Chrome** ou **Edge** → ícone **Instalar** na barra de endereço (ou menu ⋮ → *Transmitir, salvar e compartilhar* → *Instalar página como app*).

**iPhone:** abra o site no Safari → **Compartilhar** → **Adicionar à Tela de Início**.

## Modo demonstração x online

- **Sem Supabase:** tudo funciona, mas cada aparelho tem seus próprios dados (bom para testar).
- **Com Supabase:** biblioteca, convites e confirmações compartilhados entre admin, clientes e convidados.
  Siga o **GUIA-SUPABASE.md**.
