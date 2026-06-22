# Site da Fazenda da Cascata

Site institucional e de turismo rural da Fazenda da Cascata, em Alegrete, Rio
Grande do Sul. Propriedade histórica no pampa gaúcho, com cascata, capivaras,
museu rural, colheita de nozes-pecã e criação de gado a campo.

Publicado via GitHub Pages a partir da raiz do repositório.

## Estrutura

- `index.html`, `historia.html`, `museu.html`, `natureza.html`,
  `atracoes.html`, `galerias.html`, `visita.html`: as sete páginas do site.
- `assets/css/style.css`: estilo rústico campeiro (paleta de couro, madeira,
  verde-campo e creme).
- `assets/js/main.js`: menu mobile, renderização das galerias e lightbox.
- `assets/js/gallery-data.js`: manifesto das galerias (gerado, não editar a mão).
- `assets/galeria/<tema>/`: fotos e vídeos já convertidos para a web.
- `scripts/`: ferramentas de uso único para preparar a mídia.

## Galerias por tema

As fotos e vídeos são agrupados por similaridade: capivaras, pecuária, emas e
aves, colheita de nozes, paisagens do pampa, sede e estruturas, e animais da
fazenda.

## Pipeline de mídia (uso único)

Os arquivos originais (`fotos_e_videos/`, fotos `.HEIC` e vídeos `.MOV` em HEVC)
não são versionados. Para regenerar as versões web:

1. Baixar um ffmpeg estático (macOS arm64), guardado em `scripts/bin/`:

   ```bash
   bash scripts/download-ffmpeg.sh
   ```

2. Converter a mídia e gerar o manifesto:

   ```bash
   python3 scripts/build-media.py
   ```

   O script lê `scripts/media-map.json` (que classifica cada arquivo por tema),
   converte fotos HEIC em JPEG (grande + miniatura) via `sips` e vídeos HEVC em
   MP4 H.264 720p com poster via `ffmpeg`, e escreve `assets/js/gallery-data.js`.
   É idempotente: pula o que já foi convertido.

## Rodar localmente

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

## Créditos

Conteúdo histórico baseado em reportagens sobre a fazenda (programa Grandes
Fazendas, do Canal Rural, e portal Em Questão). Fotos e vídeos da propriedade.
