import os
import re
import json
import hashlib
import subprocess
from pathlib import Path

import requests
from PIL import Image
import pytesseract


# =========================================================
# CONFIG
# =========================================================

ROOT = Path(__file__).resolve().parents[1]

REQUEST_DIR = ROOT / "drive_music_requests"
MUSIC_FILE = ROOT / "music-list.js"
PROCESSED_FILE = ROOT / ".musicbot" / "processed.json"

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()


# =========================================================
# LOG
# =========================================================

def log(message):
    print(f"[MusicBot] {message}")


# =========================================================
# PROCESSED FILE
# =========================================================

def load_processed():
    try:
        if not PROCESSED_FILE.exists():
            return []

        data = json.loads(
            PROCESSED_FILE.read_text(encoding="utf-8")
        )

        if isinstance(data, list):
            return data

        return []

    except Exception:
        return []


def save_processed(data):
    PROCESSED_FILE.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    PROCESSED_FILE.write_text(
        json.dumps(
            data,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )


# =========================================================
# FILE HASH
# =========================================================

def file_hash(path):
    sha = hashlib.sha256()

    with open(path, "rb") as f:
        while True:
            chunk = f.read(1024 * 1024)

            if not chunk:
                break

            sha.update(chunk)

    return sha.hexdigest()


# =========================================================
# OCR
# =========================================================

def ocr_image(path):
    try:
        image = Image.open(path)

        # Besarkan gambar agar OCR lebih akurat
        width, height = image.size

        if width < 1600:
            scale = 1600 / width

            image = image.resize(
                (
                    int(width * scale),
                    int(height * scale)
                )
            )

        text = pytesseract.image_to_string(
            image,
            config="--psm 6",
            lang="eng"
        )

        return text.strip()

    except Exception as e:
        log(f"OCR error: {e}")
        return ""


# =========================================================
# OCR FIELD PARSER
# =========================================================

def clean_value(value):
    value = value.strip()

    # Hilangkan karakter pemisah dari OCR
    value = re.sub(r"^[\s:：\-–—]+", "", value)

    return value.strip()


def extract_field(text, patterns):
    """
    Membaca format:

    JUDUL LAGU: To the Bone

    maupun:

    JUDUL LAGU To the Bone

    maupun:

    JUDUL LAGU
    To the Bone
    """

    lines = [
        re.sub(r"\s+", " ", line).strip()
        for line in text.splitlines()
        if line.strip()
    ]

    for index, line in enumerate(lines):

        normalized = line.upper()

        for pattern in patterns:

            # -----------------------------------------
            # Format satu baris
            # -----------------------------------------

            match = re.match(
                pattern + r"\s*[:：\-]?\s*(.*)$",
                line,
                re.IGNORECASE
            )

            if match:
                value = clean_value(match.group(1))

                if value:
                    return value

                # -------------------------------------
                # Nilai ada di baris berikutnya
                # -------------------------------------

                if index + 1 < len(lines):
                    return clean_value(
                        lines[index + 1]
                    )

            # -----------------------------------------
            # Format tanpa regex anchoring
            # -----------------------------------------

            if normalized.startswith(
                pattern.upper()
            ):
                remaining = line[
                    len(pattern):
                ]

                remaining = clean_value(
                    remaining
                )

                if remaining:
                    return remaining

                if index + 1 < len(lines):
                    return clean_value(
                        lines[index + 1]
                    )

    return ""


def parse_request(text):

    student = extract_field(
        text,
        [
            r"NAMA\s+SISWA",
            r"NAMA"
        ]
    )

    title = extract_field(
        text,
        [
            r"JUDUL\s+LAGU",
            r"JUDUL"
        ]
    )

    artist = extract_field(
        text,
        [
            r"ARTIS\s*/\s*BAND",
            r"ARTIS",
            r"BAND"
        ]
    )

    time_value = extract_field(
        text,
        [
            r"WAKTU"
        ]
    )

    return {
        "student": student,
        "title": title,
        "artist": artist,
        "time": time_value
    }


# =========================================================
# YOUTUBE SEARCH
# =========================================================

def youtube_search(title, artist):

    if not YOUTUBE_API_KEY:
        log("ERROR: YOUTUBE_API_KEY tidak ditemukan.")
        return None

    query = f"{title} {artist}".strip()

    log(f"Mencari YouTube: {query}")

    url = "https://www.googleapis.com/youtube/v3/search"

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    }

    try:
        response = requests.get(
            url,
            params=params,
            timeout=30
        )

        response.raise_for_status()

        data = response.json()

        items = data.get("items", [])

        if not items:
            log("YouTube: video tidak ditemukan.")
            return None

        item = items[0]

        video_id = (
            item.get("id", {})
            .get("videoId")
        )

        snippet = item.get(
            "snippet",
            {}
        )

        if not video_id:
            return None

        return {
            "videoId": video_id,
            "name": snippet.get(
                "title",
                title
            ),
            "artist": snippet.get(
                "channelTitle",
                artist
            ),
            "cover": (
                f"https://i.ytimg.com/vi/"
                f"{video_id}/hqdefault.jpg"
            )
        }

    except Exception as e:
        log(f"YouTube API error: {e}")
        return None


# =========================================================
# READ MUSIC-LIST.JS
# =========================================================

def read_music_list():

    if not MUSIC_FILE.exists():
        return []

    text = MUSIC_FILE.read_text(
        encoding="utf-8"
    )

    # Ambil isi array
    match = re.search(
        r"window\.LOCAL_MUSIC\s*=\s*\[(.*)\]\s*;",
        text,
        re.DOTALL
    )

    if not match:
        log("Gagal menemukan window.LOCAL_MUSIC.")
        return []

    body = match.group(1)

    songs = []

    # -----------------------------------------------------
    # Parser object JavaScript sederhana
    # -----------------------------------------------------

    objects = []

    depth = 0
    start = None
    quote = None
    escaped = False

    for i, char in enumerate(body):

        if quote:

            if escaped:
                escaped = False

            elif char == "\\":
                escaped = True

            elif char == quote:
                quote = None

            continue

        if char in ('"', "'"):
            quote = char
            continue

        if char == "{":

            if depth == 0:
                start = i

            depth += 1

        elif char == "}":

            depth -= 1

            if depth == 0 and start is not None:
                objects.append(
                    body[start:i + 1]
                )

                start = None

    for obj in objects:

        song = {}

        patterns = {
            "name": r"""(?:["']?name["']?)\s*:\s*["'](.*?)["']""",
            "artist": r"""(?:["']?artist["']?)\s*:\s*["'](.*?)["']""",
            "src": r"""(?:["']?src["']?)\s*:\s*["'](.*?)["']""",
            "cover": r"""(?:["']?cover["']?)\s*:\s*["'](.*?)["']""",
            "type": r"""(?:["']?type["']?)\s*:\s*["'](.*?)["']""",
            "youtubeId": r"""(?:["']?youtubeId["']?)\s*:\s*["'](.*?)["']"""
        }

        for key, pattern in patterns.items():

            m = re.search(
                pattern,
                obj,
                re.DOTALL
            )

            if m:
                song[key] = m.group(1)

        if song:
            songs.append(song)

    return songs


# =========================================================
# WRITE MUSIC-LIST.JS
# =========================================================

def write_music_list(songs):

    lines = [
        "// Musik XI TKJ 1",
        "// File ini diperbarui otomatis oleh Music Bot.",
        "",
        "window.LOCAL_MUSIC = ["
    ]

    for index, song in enumerate(songs):

        comma = "," if index < len(songs) - 1 else ""

        lines.append("  {")

        fields = [
            "name",
            "artist",
            "src",
            "cover",
            "type",
            "youtubeId"
        ]

        existing_fields = [
            field
            for field in fields
            if field in song
        ]

        for field_index, field in enumerate(existing_fields):

            value = song[field]

            field_comma = (
                ","
                if field_index < len(existing_fields) - 1
                else ""
            )

            lines.append(
                f"    {json.dumps(field)}: "
                f"{json.dumps(value, ensure_ascii=False)}"
                f"{field_comma}"
            )

        lines.append(
            f"  }}{comma}"
        )

    lines.append("];")
    lines.append("")

    MUSIC_FILE.write_text(
        "\n".join(lines),
        encoding="utf-8"
    )


# =========================================================
# DUPLICATE CHECK
# =========================================================

def already_exists(songs, video_id):

    for song in songs:

        if song.get("youtubeId") == video_id:
            return True

        src = song.get("src", "")

        if video_id in src:
            return True

    return False


# =========================================================
# PROCESS REQUEST
# =========================================================

def process_request(path, songs):

    log(f"Memproses: {path.name}")

    text = ocr_image(path)

    print("----- HASIL OCR -----")
    print(text)
    print("---------------------")

    request = parse_request(text)

    student = request["student"]
    title = request["title"]
    artist = request["artist"]
    time_value = request["time"]

    log(f"Nama Siswa : {student}")
    log(f"Judul Lagu : {title}")
    log(f"Nama Artis : {artist}")
    log(f"Waktu      : {time_value}")

    # ==========================================
    # Validasi
    # ==========================================

    if not title:

        log(
            "Judul lagu tidak terbaca. "
            "PNG akan dicoba lagi pada run berikutnya."
        )

        return False

    if not artist:

        log(
            "Nama artis tidak terbaca. "
            "PNG akan dicoba lagi pada run berikutnya."
        )

        return False

    # ==========================================
    # YouTube
    # ==========================================

    result = youtube_search(
        title,
        artist
    )

    if not result:

        log(
            "YouTube tidak menemukan lagu. "
            "PNG akan dicoba lagi pada run berikutnya."
        )

        return False

    video_id = result["videoId"]

    log(f"YouTube Video ID: {video_id}")

    # ==========================================
    # Duplicate
    # ==========================================

    if already_exists(
        songs,
        video_id
    ):

        log(
            "Lagu sudah ada di playlist."
        )

        return True

    # ==========================================
    # Tambahkan lagu
    # ==========================================

    new_song = {
        "name": result["name"],
        "artist": result["artist"],
        "src": (
            f"https://www.youtube.com/watch?v="
            f"{video_id}"
        ),
        "cover": result["cover"],
        "type": "youtube",
        "youtubeId": video_id,
        "requestedBy": student,
        "requestTime": time_value
    }

    songs.append(new_song)

    log(
        f"Menambahkan: "
        f"{result['name']} - "
        f"{result['artist']}"
    )

    return True


# =========================================================
# MAIN
# =========================================================

def main():

    print("==========================================")
    print(" XI TKJ 1 MUSIC BOT")
    print(" Google Drive PNG -> OCR -> YouTube")
    print("==========================================")

    REQUEST_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    processed = load_processed()

    songs = read_music_list()

    log(
        f"Playlist terbaca: {len(songs)} lagu"
    )

    png_files = sorted(
        REQUEST_DIR.rglob("*.png")
    )

    log(
        f"Ditemukan {len(png_files)} PNG request."
    )

    changed = False

    for png in png_files:

        file_id = file_hash(png)

        if file_id in processed:

            log(
                f"Sudah diproses: {png.name}"
            )

            continue

        success = process_request(
            png,
            songs
        )

        if success:

            processed.append(file_id)

            changed = True

    # ==========================================
    # SAVE
    # ==========================================

    if changed:

        write_music_list(songs)

        log(
            "music-list.js berhasil diperbarui."
        )

    else:

        log(
            "Tidak ada perubahan playlist."
        )

    save_processed(processed)

    log(
        f"Playlist akhir: {len(songs)} lagu."
    )

    log("Bot selesai.")


if __name__ == "__main__":
    main()
