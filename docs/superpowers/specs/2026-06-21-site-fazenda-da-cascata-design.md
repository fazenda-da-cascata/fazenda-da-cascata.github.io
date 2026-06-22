# Design: Site Fazenda da Cascata (Alegrete-RS)

Data: 2026-06-21

## Objetivo

Criar um site institucional e de turismo rural para a Fazenda da Cascata, em
Alegrete-RS, publicado via GitHub Pages no repositório
`fazenda-da-cascata.github.io`. O site apresenta a história, o museu, as
atrações naturais e a fauna da propriedade, com galerias de fotos e vídeos
agrupadas por similaridade temática.

Restrição de escrita: não usar travessão (em dash) em nenhum texto do site,
código ou documentação. Usar vírgula, dois-pontos, parênteses ou ponto.

## Conteúdo de referência (pesquisa)

Fatos confirmados por reportagens (Canal Rural "Grandes Fazendas", Em Questão):

- Localização: Alegrete-RS, região de fronteira Brasil-Argentina, no pampa gaúcho.
- Terras que formavam a antiga Sesmaria do Parové, adquiridas em 1897.
- Sede construída em 1903, com mais de um século de história.
- Proprietário: família Fernandes (José Paulo Dornelles Fernandes).
- Cascata de aproximadamente 10 metros, a maior queda d'água da região.
- Formações rochosas que lembram um cânion, atípicas do pampa.
- Lagoa em formato de coração.
- Ponte de pedra.
- Bando de capivaras que pasta livremente perto da sede; emas e aves diversas.
- Museu da Cascata, fundado em 2010: arados de madeira, baús do século XIX,
  ferramentas antigas, equipamento fotográfico antigo. Mais de mil visitantes,
  incluindo professores alemães e americanos.
- Turismo rural: passeio "Buscando as Próprias Origens", primeiro domingo de
  junho, cerca de 44 visitantes por saída.

## Inventário de mídia

Origem: `fotos_e_videos/` (não versionado).

- 97 fotos `.HEIC` (12 MP, 4032x3024).
- 48 vídeos `.MOV` em codec HEVC (só tocam no Safari sem conversão).
- Total bruto: ~1,4 GB.

## Arquitetura

Site estático: HTML + CSS + JavaScript puro (sem framework, sem etapa de build),
servido pelo GitHub Pages a partir da raiz do repositório. Sem dependências de
runtime. O lightbox das galerias é JavaScript próprio e leve.

### Estrutura de arquivos

```
/
  index.html              Início
  historia.html           História
  museu.html              Museu
  natureza.html           Natureza & Fauna
  atracoes.html           Atrações
  galerias.html           Galerias (todos os temas)
  visita.html             Visita & Contato
  assets/
    css/style.css
    js/main.js            navegação mobile + lightbox
    js/gallery-data.js    manifesto: itens por tema, com legendas
    img/                  imagens de chrome do site (hero, og, ícones)
    galeria/<tema>/       mídia web (jpg grande, jpg thumb, mp4, poster jpg)
  scripts/
    download-ffmpeg.sh    baixa ffmpeg estático (fora do Git)
    build-media.py        pipeline de conversão (uso único)
  docs/superpowers/specs/ este documento
  .gitignore
  README.md
```

## Pipeline de mídia (script de uso único)

1. `download-ffmpeg.sh` baixa um binário `ffmpeg` estático para esta máquina,
   guardado em `scripts/bin/` (ignorado pelo Git).
2. Fotos HEIC convertidas via `sips`:
   - versão grande: máx. 2000px no maior lado, qualidade ~82%.
   - miniatura: máx. 600px, qualidade ~80%.
3. Vídeos MOV/HEVC convertidos via `ffmpeg`:
   - MP4 H.264, 720p, `-movflags +faststart`, áudio AAC.
   - pôster: um frame extraído como `.jpg`.
4. Saída em `assets/galeria/<tema>/` seguindo a classificação abaixo.
5. Script idempotente (pula saídas já existentes) e tolerante a falhas (registra
   o erro e continua). Ao final imprime a contagem de itens convertidos por tema.

Originais (`fotos_e_videos/`) e binário do ffmpeg não entram no Git. Apenas as
versões web (estimativa ~150 MB) são versionadas, dentro dos limites do GitHub.

## Galerias: agrupamento por similaridade

Classificação inicial dos 145 arquivos (ajustável durante a conversão ao
inspecionar cada item):

| Tema (pasta)            | Conteúdo                                   | Aprox.            |
|-------------------------|--------------------------------------------|-------------------|
| `capivaras`             | bando à beira d'água, luz dourada          | ~30 fotos+14 vídeos |
| `pecuaria`              | gado preto no campo verde                  | ~25 fotos+3 vídeos  |
| `emas-aves`             | emas e pássaros no campo                   | ~5 itens          |
| `nozes`                 | nogueiras (pecã), colheita, derriçadeira   | ~20 fotos+8 vídeos  |
| `paisagens`             | campos, estradas, pôr do sol, água         | ~20 fotos         |
| `sede-estruturas`       | portão de madeira, silos, currais, sede    | ~12 fotos+6 vídeos  |
| `animais`               | cães e gatos na lida                       | ~5 vídeos         |

## Páginas

- Início: hero em tela cheia, apresentação curta, destaques (cascata, capivaras,
  museu, nozes) e prévia das galerias.
- História: Sesmaria do Parové, compra de 1897, sede de 1903, família Fernandes.
- Museu: fundação em 2010, acervo, visitantes.
- Natureza & Fauna: capivaras, emas, aves, flora do pampa.
- Atrações: cascata de 10m, lagoa em formato de coração, ponte de pedra,
  formações rochosas.
- Galerias: todos os temas, cada um com grade responsiva e lightbox.
- Visita & Contato: como chegar, turismo rural, passeio de junho, contato.

## Identidade visual: rústico campeiro

- Paleta: tons terrosos e sépia, madeira, verde campo, off-white/creme.
- Tipografia: título robusto/serifa com ar tradicional; corpo legível.
- Texturas sutis (madeira/papel) sem pesar no carregamento.
- Fotografia em destaque, com bordas e detalhes que remetem ao gauchesco.

## Comportamento das galerias

- Grade responsiva (CSS grid), miniaturas com `loading="lazy"`.
- Clique abre lightbox: imagem grande ou vídeo (com `controls` e `poster`).
- Navegação por setas e teclado (esc fecha, setas trocam), foco acessível.
- `alt` descritivo em todas as imagens.

## Tratamento de erros

- Pipeline: pula arquivos ausentes ou com falha de conversão, registra e segue;
  não sobrescreve saídas já geradas.
- Site: vídeos sempre com `poster` e `controls`; imagens com `alt`; navegação
  funciona sem JavaScript (links de página), JS só enriquece (lightbox e menu).

## Verificação

- Conferir contagem: 97 fotos e 48 vídeos convertidos (ou registrar exceções).
- Servir local com `python3 -m http.server` e validar:
  - render de todas as 7 páginas e navegação entre elas.
  - lazy-load e abertura do lightbox.
  - reprodução de pelo menos um vídeo em mais de um navegador.
  - ausência de links ou imagens quebradas.

## Fora de escopo (YAGNI)

- Sem CMS, sem backend, sem formulário com envio (contato é informativo).
- Sem framework JS nem bundler.
- Sem versionar os arquivos originais nem o binário do ffmpeg.
