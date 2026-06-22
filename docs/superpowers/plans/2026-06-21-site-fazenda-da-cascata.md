# Site Fazenda da Cascata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir e publicar um site estático de turismo rural para a Fazenda da Cascata (Alegrete-RS), com 7 páginas e galerias de fotos/vídeos agrupadas por tema.

**Architecture:** HTML + CSS + JavaScript puro, sem framework e sem build de runtime, servido pelo GitHub Pages a partir da raiz. Um pipeline de uso único converte os originais HEIC/MOV em JPEG/MP4 web e emite um manifesto JS consumido pelas galerias.

**Tech Stack:** HTML5, CSS3 (grid, custom properties), JavaScript vanilla, `sips` (HEIC), `ffmpeg` estático (HEVC->H.264), `python3` (pipeline).

## Global Constraints

- Não usar travessão (em dash) em nenhum texto (site, código, docs). Usar vírgula, parênteses, dois-pontos ou ponto. Hífen e traço de intervalo numérico permitidos.
- Idioma do site: português do Brasil.
- Sem dependências de runtime e sem etapa de build para servir o site.
- Não versionar `fotos_e_videos/` nem `scripts/bin/` (já no `.gitignore`).
- Mídia web em `assets/galeria/<tema>/`; temas: `capivaras`, `pecuaria`, `emas-aves`, `nozes`, `paisagens`, `sede-estruturas`, `animais`.
- Conteúdo factual conforme o spec `docs/superpowers/specs/2026-06-21-site-fazenda-da-cascata-design.md`.

---

### Task 1: Download do ffmpeg estático

**Files:**
- Create: `scripts/download-ffmpeg.sh`

**Interfaces:**
- Produces: binário executável em `scripts/bin/ffmpeg`.

- [ ] **Step 1:** Escrever `scripts/download-ffmpeg.sh` que baixa um ffmpeg estático para macOS arm64 (fonte: evermeet.cx ou osxexperts), descompacta em `scripts/bin/ffmpeg`, dá `chmod +x`.
- [ ] **Step 2:** Rodar `bash scripts/download-ffmpeg.sh`.
- [ ] **Step 3 (verificação):** `scripts/bin/ffmpeg -version` imprime versão. Esperado: linha "ffmpeg version ...".
- [ ] **Step 4:** Commit de `scripts/download-ffmpeg.sh` (o binário é ignorado).

---

### Task 2: Mapa de classificação da mídia

**Files:**
- Create: `scripts/media-map.json`

**Interfaces:**
- Produces: JSON `{ "<tema>": { "label": str, "items": [ {"src": "IMG_0293.HEIC", "caption": str}, ... ] } }` cobrindo os 145 arquivos.

- [ ] **Step 1:** Revisar as contact sheets e atribuir cada um dos 97 HEIC e 48 MOV a exatamente um tema, com legenda curta.
- [ ] **Step 2 (verificação):** Script de checagem conta itens no JSON e compara com `ls fotos_e_videos`. Esperado: 145 itens, zero arquivos sem tema, zero duplicados.
- [ ] **Step 3:** Commit de `scripts/media-map.json`.

---

### Task 3: Pipeline de conversão + manifesto

**Files:**
- Create: `scripts/build-media.py`
- Create (saída): `assets/galeria/<tema>/*.jpg|*.mp4`, `assets/js/gallery-data.js`

**Interfaces:**
- Consumes: `scripts/media-map.json`, `scripts/bin/ffmpeg`, `fotos_e_videos/`.
- Produces: para cada foto `slug.jpg` (<=2000px) + `slug-thumb.jpg` (<=600px); para cada vídeo `slug.mp4` + `slug-poster.jpg`. Emite `assets/js/gallery-data.js` com `window.GALERIAS = [{tema,label,itens:[{tipo,full,thumb,poster,caption}]}]`.

- [ ] **Step 1:** Escrever `build-media.py`: lê o mapa; para HEIC usa `sips -s format jpeg -Z 2000` (grande) e `-Z 600` (thumb); para MOV usa ffmpeg `-vf scale=-2:720 -c:v libx264 -crf 23 -movflags +faststart -c:a aac` e extrai poster com `-frames:v 1`. Idempotente (pula saída existente), tolerante a falhas (log e segue).
- [ ] **Step 2:** Rodar `python3 scripts/build-media.py`.
- [ ] **Step 3 (verificação):** Contagem de `.jpg` grandes == 97 (fotos) + posters, e `.mp4` == 48 (ou registrar exceções). Conferir que `assets/js/gallery-data.js` existe e é JS válido (`node`/`python` parse simples ou grep).
- [ ] **Step 4:** Commit das saídas web (`assets/galeria/`, `assets/js/gallery-data.js`) e do script.

---

### Task 4: CSS rústico campeiro + cabeçalho/rodapé compartilhados

**Files:**
- Create: `assets/css/style.css`
- Create: `assets/js/main.js` (menu mobile + lightbox; lightbox usado na Task 6)

**Interfaces:**
- Produces: classes utilitárias e de layout (`.site-header`, `.nav`, `.hero`, `.section`, `.galeria-grid`, `.card`, `.lightbox`), custom properties de cor/tipografia. `main.js` expõe inicialização de menu e de lightbox por `data-` attributes.

- [ ] **Step 1:** Definir paleta (sépia/madeira/verde campo/creme), tipografia (título serifa tradicional via Google Fonts ou fonte do sistema; corpo legível), base responsiva mobile-first, header fixo com navegação e rodapé.
- [ ] **Step 2:** Escrever `main.js`: toggle do menu mobile; lightbox acessível (abre por clique em `[data-lightbox]`, suporta `img` e `video`, setas/esc/teclado, trap de foco).
- [ ] **Step 3 (verificação):** Criar `index.html` mínimo temporário não é necessário; validar CSS/JS por lint manual (sem erros de sintaxe) e revisão visual na Task 6.
- [ ] **Step 4:** Commit de `style.css` e `main.js`.

---

### Task 5: Estrutura de páginas e navegação compartilhada

**Files:**
- Create: `index.html`, `historia.html`, `museu.html`, `natureza.html`, `atracoes.html`, `galerias.html`, `visita.html`

**Interfaces:**
- Consumes: `style.css`, `main.js`.
- Produces: as 7 páginas com mesmo header/footer e `<head>` (meta viewport, título, descrição, og tags).

- [ ] **Step 1:** Criar as 7 páginas com header/footer idênticos e navegação marcando a página ativa. Conteúdo inicial mínimo por seção, a ser preenchido nas tasks seguintes.
- [ ] **Step 2 (verificação):** `python3 -m http.server` e abrir cada URL: todas carregam, navegação funciona, CSS aplica. Esperado: zero 404 de páginas; links de nav corretos.
- [ ] **Step 3:** Commit das 7 páginas.

---

### Task 6: Galerias (galerias.html) + lightbox em funcionamento

**Files:**
- Modify: `galerias.html`
- Consumes: `assets/js/gallery-data.js`, `main.js`, `style.css`

- [ ] **Step 1:** Em `galerias.html`, renderizar (via JS a partir de `window.GALERIAS`) uma seção por tema com título e grade de miniaturas (`loading="lazy"`); cada item com `data-lightbox`, full/poster e legenda. Vídeos no lightbox com `controls` e `poster`.
- [ ] **Step 2 (verificação):** Servir local: cada tema aparece com suas miniaturas; clicar abre o lightbox; um vídeo toca; setas e esc funcionam. Esperado: 7 temas, imagens carregam, vídeo reproduz.
- [ ] **Step 3:** Commit.

---

### Task 7: Conteúdo das páginas de texto (Início, História, Museu, Natureza, Atrações, Visita)

**Files:**
- Modify: `index.html`, `historia.html`, `museu.html`, `natureza.html`, `atracoes.html`, `visita.html`

- [ ] **Step 1:** Início: hero em tela cheia com foto de capivaras/cascata, apresentação, blocos de destaque (cascata, capivaras, museu, nozes) e prévia das galerias.
- [ ] **Step 2:** História: Sesmaria do Parové, compra de 1897, sede de 1903, família Fernandes (texto do spec).
- [ ] **Step 3:** Museu: fundação em 2010, acervo (arados de madeira, baús do século XIX, ferramentas, equipamento fotográfico), mais de mil visitantes.
- [ ] **Step 4:** Natureza & Fauna: capivaras, emas, aves, flora do pampa, com fotos.
- [ ] **Step 5:** Atrações: cascata de 10m, lagoa em formato de coração, ponte de pedra, formações rochosas.
- [ ] **Step 6:** Visita & Contato: como chegar a Alegrete, turismo rural, passeio "Buscando as Próprias Origens" (primeiro domingo de junho), bloco de contato informativo.
- [ ] **Step 7 (verificação):** Servir local e revisar cada página: sem travessões, imagens carregam, texto coerente. Commit.

---

### Task 8: README, ajuste do GitHub Pages e verificação final

**Files:**
- Create: `README.md`

- [ ] **Step 1:** README explicando o projeto, como rodar o pipeline (`download-ffmpeg.sh`, `build-media.py`) e como servir local.
- [ ] **Step 2 (verificação):** Varredura final: nenhum link/imagem quebrada (checar todos os `src`/`href` contra arquivos), nenhum travessão em arquivos `.html`/`.md`, todas as páginas renderizam, lightbox e vídeo funcionam.
- [ ] **Step 3:** Commit final.

## Self-Review

- Cobertura do spec: pipeline (Task 1-3), galerias por tema (Task 2,3,6), 7 páginas (Task 5,7), identidade rústica (Task 4), conteúdo factual (Task 7), verificação (Task 5,6,8). Coberto.
- Sem placeholders de implementação: cada task tem ação concreta e verificação.
- Consistência de tipos: manifesto `window.GALERIAS` definido na Task 3 e consumido na Task 6 com os mesmos campos (`tema,label,itens[{tipo,full,thumb,poster,caption}]`).
