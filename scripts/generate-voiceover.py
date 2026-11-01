"""Generate the Partisi 1 voice-over with an offline Indonesian Piper TTS voice.

Setup (once):
  pip install piper-tts
  curl -L -o voice.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-id_ID-news_tts-medium.tar.bz2
  tar xjf voice.tar.bz2

Run from the repo root:
  python3 scripts/generate-voiceover.py ./vits-piper-id_ID-news_tts-medium [length_scale]

length_scale > 1.0 speaks slower, < 1.0 faster (default 1.0).

Writes public/voiceover/partisi1/<id>.wav and manifest.json. The video
reads manifest.json to time each scene, so re-render after regenerating.

`speak` is the text sent to TTS. English product terms are spelled
phonetically so the Indonesian voice says them closer to English. The
on-screen subtitle text is in src/partisi1/vo.ts.
"""

import json
import os
import sys
import wave

from piper import PiperVoice, SynthesisConfig

LINES = [
    {
        "id": "01-intro",
        "speak": "Sebelum unit turun ke lapangan, pastikan dua perangkat utama siap beroperasi.",
    },
    {
        "id": "02-devices",
        "speak": "GPS Star Fayer tujuh ribu lima ratus, dan Display Komand Senter Ji Faiv.",
    },
    {
        "id": "03-status",
        "speak": "Buka Stetus Senter, pastikan nilai Ekyurasi telah mencapai angka seratus persen penuh.",
    },
    {
        "id": "04-field",
        "speak": "Begitu masuk ke area kerja, langsung tentukan Baundari lokasi, serta jalur kerja E Bi Lain yang benar.",
    },
]

OUT_DIR = os.path.join("public", "voiceover", "partisi1")
MODEL = "id_ID-news_tts-medium.onnx"


def main() -> None:
    model_dir = sys.argv[1]
    length_scale = float(sys.argv[2]) if len(sys.argv) > 2 else 1.0
    voice = PiperVoice.load(
        os.path.join(model_dir, MODEL),
        config_path=os.path.join(model_dir, MODEL + ".json"),
    )
    syn = SynthesisConfig(length_scale=length_scale)
    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {}
    for line in LINES:
        path = os.path.join(OUT_DIR, f"{line['id']}.wav")
        with wave.open(path, "wb") as w:
            voice.synthesize_wav(line["speak"], w, syn_config=syn)
        with wave.open(path, "rb") as r:
            duration = round(r.getnframes() / r.getframerate(), 3)
        manifest[line["id"]] = {
            "file": f"voiceover/partisi1/{line['id']}.wav",
            "duration": duration,
        }
        print(f"{path}: {duration}s")
    with open(os.path.join(OUT_DIR, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()
