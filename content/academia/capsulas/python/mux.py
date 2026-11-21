"""Añade la locución (audio/<id>/NN-*.mp3) a cada MP4 ya renderizado con los tiempos de timings.json.

Cada frase entra LEAD segundos después del inicio de su tramo. El video no se recodifica; el audio se
normaliza a -16 LUFS. Repetible: siempre toma solo la pista de video del MP4.

  python mux.py            # todas las cápsulas con audio
  python mux.py 1.3-a      # solo esas
"""
import subprocess
import sys

from catalog import AUDIO, catalog, core
from tts import FF, LEAD


def mux(c):
    files = sorted((AUDIO / c["id"]).glob("[0-9][0-9]-*.mp3"))
    if len(files) != len(c["beats"]):
        return f"{c['id']}: sin audio completo ({len(files)}/{len(c['beats'])})"
    video = core.ROOT / core.LEVELS[c["level"]] / f"{c['id']}-{c['slug']}.mp4"
    tmp = video.with_suffix(".tmp.mp4")
    starts, t = [], core.INTRO
    for b in c["beats"]:
        starts.append(t + LEAD)
        t += b["secs"]
    cmd = [FF, "-y", "-loglevel", "error", "-i", str(video)]
    for f in files:
        cmd += ["-i", str(f)]
    chains = [f"[{i + 1}:a]adelay={int(s * 1000)}:all=1[a{i}]" for i, s in enumerate(starts)]
    mix = "".join(f"[a{i}]" for i in range(len(files)))
    flt = ";".join(chains) + f";{mix}amix=inputs={len(files)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11,apad[out]"
    cmd += ["-filter_complex", flt, "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
            "-ar", "44100", "-shortest", "-movflags", "+faststart", str(tmp)]
    subprocess.run(cmd, check=True)
    tmp.replace(video)
    return f"{c['id']}: ok"


if __name__ == "__main__":
    ids = sys.argv[1:]
    for c in catalog():
        if not ids or c["id"] in ids:
            print(mux(c))
