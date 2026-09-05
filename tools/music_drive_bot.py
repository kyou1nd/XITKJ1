import os
import re
import json
import ast
import hashlib
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request

import pytesseract
from PIL import Image


# ============================================================
# CONFIG
# ============================================================

ROOT = Path(__file__).resolve().parents[1]

PLAYLIST = ROOT / "music-list.js"
REQUEST_DIR = ROOT / "drive_music_requests"
STATE_DIR = ROOT / ".musicbot"
PROCESSED_FILE = STATE_DIR / "processed.json"

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()

# Folder Google Drive request lagu
DRIVE_FOLDER_ID = "1oO4PNM4-kQpB4UVk-kWSz7mLC0XaTfko"


# ============================================================
# UTILITY
# ============================================================

def log(message):
    print(f"[MusicBot] {message}", flush=True)


def ensure_state():
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if not PROCESSED_FILE.exists():
        PROCESSED_FILE.write_text(
            "[]",
            encoding="utf-8"
        )


def load_processed():
    ensure_state()

    try:
        data = json.loads(
            PROCESSED_FILE.read_text(encoding="utf-8")
        )

        if isinstance(data, list):
            return set(data)

        return set()

    except Exception:
        return set()


def save_processed(processed):
    ensure_state()

    PROCESSED_FILE.write_text(
        json.dumps(
            sorted(processed),
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )


# ============================================================
# READ music-list.js
# ============================================================

def extract_playlist_array(text):
    """
    Mengambil array dari:

    window.LOCAL_MUSIC = [
        ...
    ];
    """

    marker = "window.LOCAL_MUSIC"

    marker_pos = text.find(marker)

    if marker_pos == -1:
        raise ValueError(
            "window.LOCAL_MUSIC tidak ditemukan di music-list.js"
        )

    start = text.find("[", marker_pos)

    if start == -1:
        raise ValueError(
            "Array LOCAL_MUSIC tidak ditemukan."
        )

    depth = 0
    in_string = False
    string_char = None
    escape = False

    for i in range(start, len(text)):

        char = text[i]

        if in_string:

            if escape:
                escape = False
                continue

            if char == "\\":
                escape = True
                continue

            if char == string_char:
                in_string = False
                string_char = None

            continue

        if char in ("'", '"'):
            in_string = True
            string_char = char
            continue

        if char == "[":
            depth += 1

        elif char == "]":
            depth -= 1

            if depth == 0:
                return text[start:i + 1]

    raise ValueError(
        "Array LOCAL_MUSIC tidak memiliki penutup ]."
    )


def convert_js_array_to_python(raw):
    """
    music-list.js bukan JSON murni karena key seperti:

    {
      name: "...",
      artist: "..."
    }

    Fungsi ini mengubah key tersebut agar bisa
    dibaca oleh Python.
    """

    # Hapus komentar // ...
    raw = re.sub(
        r"//.*?$",
        "",
        raw,
        flags=re.MULTILINE
    )

    # Ubah key JavaScript:
    #
    # name:
    #
    # menjadi:
    #
    # "name":
    raw = re.sub(
        r'([{\[,])\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*:',
        r'\1 "\2":',
        raw
    )

    # Python ast bisa membaca trailing comma,
    # string JSON, object, dan array.
    return ast.literal_eval(raw)


def load_playlist():
    """
    Membaca music-list.js dengan format:

    window.LOCAL_MUSIC = [
        {...}
    ];
    """

    if not PLAYLIST.exists():
        log("music-list.js belum ada. Membuat playlist kosong.")
        return []

    text = PLAYLIST.read_text(
        encoding="utf-8"
    )

    raw_array = extract_playlist_array(text)

    try:
        songs = convert_js_array_to_python(raw_array)
    except Exception as error:
        log("Gagal membaca music-list.js.")
        log(f"Detail: {error}")
        raise

    if not isinstance(songs, list):
        raise ValueError(
            "LOCAL_MUSIC harus berupa array/list."
        )

    return songs


# ============================================================
# WRITE music-list.js
# ============================================================

def save_playlist(songs):
    """
    Menyimpan playlist kembali dalam format
    JavaScript yang sesuai dengan website.
    """

    playlist_json = json.dumps(
        songs,
        ensure_ascii=False,
        indent=2
    )

    content = """// Musik XI TKJ 1.
// Playlist ini diperbarui otomatis oleh Music Bot.
// Jangan hapus window.LOCAL_MUSIC.

window.LOCAL_MUSIC = %s;
""" % playlist_json

    PLAYLIST.write_text(
        content,
        encoding="utf-8"
    )


# ============================================================
# OCR
# ============================================================

def clean_text(value):
    if not value:
        return ""

    value = value.replace("\r", "\n")

    # Rapikan spasi
    value = re.sub(
        r"[ \t]+",
        " ",
        value
    )

    return value.strip()


def find_field(text, field_names):
    """
    Mencari format seperti:

    Nama Siswa : Budi
    Judul Lagu: Iqro
    Nama Artis: Raim Laode
    Waktu: 12:30
    """

    lines = text.splitlines()

    for line in lines:

        line = clean_text(line)

        if not line:
            continue

        for field in field_names:

            pattern = (
                r"^\s*"
                + re.escape(field)
                + r"\s*[:\-]\s*(.+?)\s*$"
            )

            match = re.search(
                pattern,
                line,
                flags=re.IGNORECASE
            )

            if match:
                return clean_text(
                    match.group(1)
                )

    return ""


def parse_request_text(text):
    """
    Mengambil data request dari hasil OCR.
    """

    student = find_field(
        text,
        [
            "Nama Siswa",
            "Nama Siswa.",
            "Nama"
        ]
    )

    title = find_field(
        text,
        [
            "Judul Lagu",
            "Judul Lagu.",
            "Judul"
        ]
    )

    artist = find_field(
        text,
        [
            "Nama Artis",
            "Nama Artis.",
            "Artis",
            "Artist"
        ]
    )

    request_time = find_field(
        text,
        [
            "Waktu",
            "Jam",
            "Time"
        ]
    )

    return {
        "student": student,
        "title": title,
        "artist": artist,
        "time": request_time
    }


def run_ocr(image_path):
    log(f"OCR: {image_path.name}")

    image = Image.open(image_path)

    # Pastikan RGB
    if image.mode != "RGB":
        image = image.convert("RGB")

    # OCR
    text = pytesseract.image_to_string(
        image,
        config="--psm 6",
        lang="eng"
    )

    return text


# ============================================================
# YOUTUBE API
# ============================================================

def search_youtube(title, artist):
    if not YOUTUBE_API_KEY:
        raise RuntimeError(
            "YOUTUBE_API_KEY belum tersedia."
        )

    if artist:
        query = f"{title} {artist}"
    else:
        query = title

    log(f"Cari YouTube: {query}")

    params = urlencode({
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    })

    url = (
        "https://www.googleapis.com/youtube/v3/search?"
        + params
    )

    request = Request(
        url,
        headers={
            "User-Agent": "XI-TKJ1-MusicBot/1.0"
        }
    )

    with urlopen(
        request,
        timeout=30
    ) as response:

        data = json.loads(
            response.read().decode("utf-8")
        )

    items = data.get("items", [])

    if not items:
        log("YouTube: tidak ditemukan.")
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

    channel = snippet.get(
        "channelTitle",
        artist or "Unknown"
    )

    youtube_title = snippet.get(
        "title",
        title
    )

    thumbnails = snippet.get(
        "thumbnails",
        {}
    )

    thumbnail = (
        thumbnails.get("high", {}).get("url")
        or thumbnails.get("medium", {}).get("url")
        or thumbnails.get("default", {}).get("url")
        or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    )

    return {
        "videoId": video_id,
        "title": youtube_title,
        "channel": channel,
        "thumbnail": thumbnail
    }


# ============================================================
# CREATE SONG
# ============================================================

def make_song(request, youtube):
    title = request["title"]
    artist = request["artist"]

    return {
        "name": youtube["title"] or title,
        "artist": youtube["channel"] or artist or "Unknown",
        "src": (
            "https://www.youtube.com/watch?v="
            + youtube["videoId"]
        ),
        "cover": youtube["thumbnail"],
        "type": "youtube",
        "youtubeId": youtube["videoId"],
        "requestedBy": request["student"],
        "requestTime": request["time"]
    }


# ============================================================
# DUPLICATE CHECK
# ============================================================

def already_exists(songs, video_id):
    for song in songs:

        if not isinstance(song, dict):
            continue

        if song.get("youtubeId") == video_id:
            return True

        src = str(
            song.get("src", "")
        )

        if video_id in src:
            return True

    return False


# ============================================================
# PROCESS ONE PNG
# ============================================================

def process_png(image_path, songs, processed):
    file_hash = hashlib.sha256(
        image_path.read_bytes()
    ).hexdigest()

    if file_hash in processed:
        log(
            f"SKIP: {image_path.name} "
            "(sudah diproses)"
        )
        return False

    log("=" * 60)
    log(f"REQUEST: {image_path.name}")

    # --------------------------------------------------------
    # OCR
    # --------------------------------------------------------

    try:
        ocr_text = run_ocr(
            image_path
        )
    except Exception as error:
        log(f"OCR ERROR: {error}")
        return False

    log("Hasil OCR:")
    print(ocr_text)

    request = parse_request_text(
        ocr_text
    )

    log(
        f"Nama Siswa : {request['student']}"
    )

    log(
        f"Judul Lagu : {request['title']}"
    )

    log(
        f"Nama Artis : {request['artist']}"
    )

    log(
        f"Waktu      : {request['time']}"
    )

    # --------------------------------------------------------
    # VALIDASI
    # --------------------------------------------------------

    if not request["title"]:
        log(
            "REQUEST DILEWATI: "
            "Judul Lagu tidak terbaca."
        )

        return False

    # --------------------------------------------------------
    # YOUTUBE
    # --------------------------------------------------------

    try:
        youtube = search_youtube(
            request["title"],
            request["artist"]
        )

    except Exception as error:
        log(
            f"YouTube API ERROR: {error}"
        )

        return False

    if not youtube:
        log(
            "REQUEST DILEWATI: "
            "Video YouTube tidak ditemukan."
        )

        return False

    # --------------------------------------------------------
    # DUPLICATE
    # --------------------------------------------------------

    if already_exists(
        songs,
        youtube["videoId"]
    ):
        log(
            "Lagu sudah ada di playlist."
        )

        processed.add(file_hash)

        return False

    # --------------------------------------------------------
    # ADD SONG
    # --------------------------------------------------------

    new_song = make_song(
        request,
        youtube
    )

    songs.append(
        new_song
    )

    processed.add(
        file_hash
    )

    log(
        "BERHASIL MENAMBAHKAN:"
    )

    log(
        f"{new_song['name']} "
        f"- {new_song['artist']}"
    )

    return True


# ============================================================
# MAIN
# ============================================================

def main():

    log("==========================================")
    log(" XI TKJ 1 MUSIC BOT")
    log(" Google Drive PNG → OCR → YouTube")
    log("==========================================")

    # --------------------------------------------------------
    # Check API
    # --------------------------------------------------------

    if not YOUTUBE_API_KEY:
        raise RuntimeError(
            "Secret YOUTUBE_API_KEY tidak ditemukan."
        )

    # --------------------------------------------------------
    # Prepare
    # --------------------------------------------------------

    ensure_state()

    processed = load_processed()

    songs = load_playlist()

    log(
        f"Playlist saat ini: {len(songs)} lagu"
    )

    # --------------------------------------------------------
    # Request folder
    # --------------------------------------------------------

    if not REQUEST_DIR.exists():

        log(
            "Folder drive_music_requests "
            "tidak ditemukan."
        )

        log(
            "Tidak ada PNG request."
        )

        return

    png_files = sorted(
        REQUEST_DIR.rglob("*.png")
    )

    if not png_files:

        log(
            "Tidak ada file PNG request."
        )

        return

    log(
        f"Ditemukan {len(png_files)} PNG."
    )

    changed = False

    # --------------------------------------------------------
    # Process
    # --------------------------------------------------------

    for image_path in png_files:

        try:

            result = process_png(
                image_path,
                songs,
                processed
            )

            if result:
                changed = True

        except Exception as error:

            log(
                f"ERROR memproses "
                f"{image_path.name}: {error}"
            )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    if changed:

        save_playlist(
            songs
        )

        log(
            "music-list.js berhasil diperbarui."
        )

    else:

        log(
            "Tidak ada perubahan playlist."
        )

    save_processed(
        processed
    )

    log(
        f"Playlist akhir: {len(songs)} lagu"
    )

    log("Selesai.")


if __name__ == "__main__":
    main()
