#!/usr/bin/env python3
"""Pipeline de conversao da midia da Fazenda da Cascata.

Le scripts/media-map.json e converte os originais de fotos_e_videos/ em
versoes web em assets/galeria/<tema>/:
  - fotos HEIC -> JPEG grande (<=2000px) + miniatura (<=600px) via sips
  - videos MOV/HEVC -> MP4 H.264 720p (faststart) + poster JPEG via ffmpeg

Emite assets/js/gallery-data.js com o manifesto consumido pelas galerias.
Idempotente (pula saidas ja existentes) e tolerante a falhas (registra e segue).
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "fotos_e_videos")
OUT_DIR = os.path.join(ROOT, "assets", "galeria")
FFMPEG = os.path.join(ROOT, "scripts", "bin", "ffmpeg")
MAP = os.path.join(ROOT, "scripts", "media-map.json")
DATA_JS = os.path.join(ROOT, "assets", "js", "gallery-data.js")


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def convert_photo(src, slug, dest_dir):
    full = os.path.join(dest_dir, slug + ".jpg")
    thumb = os.path.join(dest_dir, slug + "-thumb.jpg")
    if not os.path.exists(full):
        run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "82",
             "-Z", "2000", src, "--out", full])
    if not os.path.exists(thumb):
        run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "80",
             "-Z", "600", src, "--out", thumb])
    return full, thumb


def convert_video(src, slug, dest_dir):
    mp4 = os.path.join(dest_dir, slug + ".mp4")
    poster = os.path.join(dest_dir, slug + "-poster.jpg")
    if not os.path.exists(mp4):
        run([FFMPEG, "-y", "-i", src,
             "-vf", "scale=-2:720", "-r", "30",
             "-c:v", "libx264", "-crf", "28",
             "-maxrate", "1600k", "-bufsize", "3200k",
             "-preset", "medium", "-pix_fmt", "yuv420p",
             "-movflags", "+faststart", "-c:a", "aac", "-b:a", "96k", mp4])
    if not os.path.exists(poster):
        run([FFMPEG, "-y", "-ss", "1", "-i", src, "-frames:v", "1",
             "-vf", "scale=-2:720", poster])
    return mp4, poster


def rel(path):
    return os.path.relpath(path, ROOT).replace(os.sep, "/")


def main():
    with open(MAP, encoding="utf-8") as f:
        media = json.load(f)

    galerias = []
    ok = {"photo": 0, "video": 0}
    fail = []

    for slug, group in media.items():
        dest_dir = os.path.join(OUT_DIR, slug)
        os.makedirs(dest_dir, exist_ok=True)
        itens = []
        for item in group["items"]:
            src = os.path.join(SRC_DIR, item["src"])
            name = os.path.splitext(item["src"])[0]
            if not os.path.exists(src):
                fail.append((item["src"], "origem ausente"))
                continue
            try:
                if item["type"] == "photo":
                    full, thumb = convert_photo(src, name, dest_dir)
                    itens.append({"tipo": "photo", "full": rel(full),
                                  "thumb": rel(thumb), "poster": None,
                                  "caption": item["caption"]})
                else:
                    mp4, poster = convert_video(src, name, dest_dir)
                    itens.append({"tipo": "video", "full": rel(mp4),
                                  "thumb": rel(poster), "poster": rel(poster),
                                  "caption": item["caption"]})
                ok[item["type"]] += 1
            except subprocess.CalledProcessError as e:
                fail.append((item["src"], str(e)))
                print("FALHA:", item["src"], file=sys.stderr)
        galerias.append({"tema": slug, "label": group["label"], "itens": itens})
        print(f"  {slug}: {len(itens)} itens")

    os.makedirs(os.path.dirname(DATA_JS), exist_ok=True)
    with open(DATA_JS, "w", encoding="utf-8") as f:
        f.write("// Gerado por scripts/build-media.py. Nao editar a mao.\n")
        f.write("window.GALERIAS = ")
        json.dump(galerias, f, ensure_ascii=False, indent=2)
        f.write(";\n")

    print(f"\nConvertidos -> fotos: {ok['photo']} | videos: {ok['video']}")
    if fail:
        print("Falhas:", fail)
    print("Manifesto:", rel(DATA_JS))


if __name__ == "__main__":
    main()
