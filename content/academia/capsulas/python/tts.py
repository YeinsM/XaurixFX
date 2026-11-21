"""Locución con ElevenLabs: un MP3 por tramo, en caché, y tiempos de tramo ajustados al audio.

La clave se lee de ELEVENLABS_API_KEY (variable de entorno o capsulas/.env, que no se versiona).

  python tts.py --voices                    # voces de la cuenta (id, nombre, acento, género)
  python tts.py --sample ID [ID ...]        # una frase de prueba por voz en audio/_muestras/
  python tts.py --voice ID                  # fija la voz (audio/voz.json) y genera todo
  python tts.py [cápsulas...]               # genera con la voz fijada; solo lo que falta
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request

import imageio_ffmpeg

from catalog import AUDIO, TIMINGS, catalog, core, speakable

API = "https://api.elevenlabs.io/v1"
MODEL = "eleven_multilingual_v2"
SETTINGS = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.15, "use_speaker_boost": True}
PAD = 0.8          # segundos de aire tras cada frase
LEAD = 0.25        # la voz entra este tiempo después de que cambia el tramo
VOICE_FILE = AUDIO / "voz.json"
FF = imageio_ffmpeg.get_ffmpeg_exe()


def key():
    # TTS_KEY_VAR permite usar otra clave (p. ej. ELEVENLABS_API_KEY2) sin tocar el código.
    name = os.environ.get("TTS_KEY_VAR", "ELEVENLABS_API_KEY")
    k = os.environ.get(name)
    env = core.ROOT / ".env"
    if not k and env.exists():
        m = re.search(rf"^{re.escape(name)}\s*=\s*(\S+)", env.read_text(encoding="utf-8"), re.M)
        k = m and m.group(1).strip("'\"")
    if not k:
        sys.exit(f"Falta {name} (en el entorno o en content/academia/capsulas/.env)")
    return k


def call(path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None,
                                 headers={"xi-api-key": key(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f"ElevenLabs {e.code}: {e.read().decode(errors='replace')[:400]}")


def tts(text, voice, out, prev="", nxt=""):
    body = {"text": text, "model_id": MODEL, "voice_settings": SETTINGS}
    if prev:
        body["previous_text"] = prev
    if nxt:
        body["next_text"] = nxt
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(call(f"/text-to-speech/{voice}?output_format=mp3_44100_128", body))


def duration(f):
    err = subprocess.run([FF, "-i", str(f)], capture_output=True, text=True).stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def main(args):
    if "--voices" in args:
        for v in json.loads(call("/voices"))["voices"]:
            lab = v.get("labels") or {}
            print(f"{v['voice_id']}  {v['name']:<28} {lab.get('accent', ''):<14} {lab.get('gender', '')}")
        return
    if "--sample" in args:
        text = json.loads((AUDIO / "narracion.json").read_text(encoding="utf-8"))["1.4-a"][1]
        for vid in [a for a in args if not a.startswith("--")]:
            tts(text, vid, AUDIO / "_muestras" / f"{vid}.mp3")
            print("muestra", vid)
        return
    if "--voice" in args:
        vid = args[args.index("--voice") + 1]
        AUDIO.mkdir(exist_ok=True)
        VOICE_FILE.write_text(json.dumps({"voice_id": vid, "model": MODEL}), encoding="utf-8")
        args = [a for a in args if a not in ("--voice", vid)]
    if not VOICE_FILE.exists():
        sys.exit("Elige primero una voz con --voice ID")
    voice = json.loads(VOICE_FILE.read_text(encoding="utf-8"))["voice_id"]
    timings = json.loads(TIMINGS.read_text(encoding="utf-8")) if TIMINGS.exists() else {}
    chars = 0
    nfile = AUDIO / "narracion.json"
    narration = json.loads(nfile.read_text(encoding="utf-8")) if nfile.exists() else {}
    for c in catalog(base=True):
        if args and c["id"] not in args:
            continue
        spoken = narration.get(c["id"])
        if spoken and len(spoken) == len(c["beats"]):
            texts = [speakable(t) for t in spoken]          # guion natural de locución
        else:
            texts = [speakable(b["text"]) for b in c["beats"]]
        secs = []
        for k, (b, t) in enumerate(zip(c["beats"], texts)):
            h = hashlib.sha1(f"{voice}|{MODEL}|{t}".encode()).hexdigest()[:10]
            f = AUDIO / c["id"] / f"{k:02d}-{h}.mp3"
            if not f.exists():
                for old in (AUDIO / c["id"]).glob(f"{k:02d}-*.mp3"):
                    old.unlink()
                tts(t, voice, f, texts[k - 1] if k else "", texts[k + 1] if k + 1 < len(texts) else "")
                chars += len(t)
            secs.append(round(max(b["secs"], LEAD + duration(f) + PAD), 2))
        timings[c["id"]] = secs
        # Se guarda tras cada cápsula: si se agota la cuota, lo ya generado queda utilizable.
        TIMINGS.write_text(json.dumps(timings, indent=1), encoding="utf-8")
        (core.ROOT / "remotion" / "src" / "timings.json").write_text(json.dumps(timings, indent=1), encoding="utf-8")
        print(c["id"], f"{sum(secs):.1f}s", flush=True)
    print("caracteres enviados:", chars)


if __name__ == "__main__":
    main(sys.argv[1:])
