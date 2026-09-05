import os
import re
import json
import hashlib
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import pytesseract
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]

PLAYLIST = ROOT / "music-list.js"
REQUEST_DIR = ROOT / "drive_music_requests"

STATE_DIR = ROOT / ".musicbot"
PROCESSED_FILE = STATE_DIR / "processed.json"

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY", "").strip()


def log(text):
    print(f"[MusicBot] {text}", flush=True)


# =========================================================
# STATE
# =========================================================

def load_processed():
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    if not PROCESSED_FILE.exists():
        return set()

    try:
        data = json.loads(
            PROCESSED_FILE.read_text(encoding="utf-8")
        )

        return set(data)

    except Exception:
        return set()


def save_processed(processed):
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    PROCESSED_FILE.write_text(
        json.dumps(
            sorted(processed),
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )


# =========================================================
# JAVASCRIPT PARSER
# =========================================================

def find_playlist_array(text):
    marker = "window.LOCAL_MUSIC"

    marker_pos = text.find(marker)

    if marker_pos == -1:
        raise ValueError(
            "window.LOCAL_MUSIC tidak ditemukan."
        )

    start = text.find("[", marker_pos)

    if start == -1:
        raise ValueError(
            "Array LOCAL_MUSIC tidak ditemukan."
        )

    depth = 0
    quote = None
    escaped = False

    for i in range(start, len(text)):

        ch = text[i]

        if quote:

            if escaped:
                escaped = False
                continue

            if ch == "\\":
                escaped = True
                continue

            if ch == quote:
                quote = None

            continue

        if ch in ("'", '"'):
            quote = ch

        elif ch == "[":
            depth += 1

        elif ch == "]":
            depth -= 1

            if depth == 0:
                return start, i

    raise ValueError(
        "Array LOCAL_MUSIC tidak lengkap."
    )


def parse_js_strings(array_text):
    """
    Membaca object JavaScript satu per satu.

    Tidak menggunakan ast.literal_eval.
    Tidak mengubah URL.
    """

    objects = []

    depth = 0
    object_start = None

    quote = None
    escaped = False

    for i, ch in enumerate(array_text):

        if quote:

            if escaped:
                escaped = False
                continue

            if ch == "\\":
                escaped = True
                continue

            if ch == quote:
                quote = None

            continue

        if ch in ("'", '"'):
            quote = ch
            continue

        if ch == "{":

            if depth == 0:
                object_start = i

            depth += 1

        elif ch == "}":

            depth -= 1

            if depth == 0 and object_start is not None:

                obj_text = array_text[
                    object_start:i + 1
                ]

                objects.append(
                    obj_text
                )

                object_start = None

    return objects


def js_unescape(value):
    """
    Mengubah escape JavaScript sederhana.
    """

    value = value.replace(
        r"\/",
        "/"
    )

    value = value.replace(
        r"\"",
        '"'
    )

    value = value.replace(
        r"\'",
        "'"
    )

    value = value.replace(
        r"\n",
        "\n"
    )

    value = value.replace(
        r"\r",
        "\r"
    )

    return value


def parse_object(obj_text):

    result = {}

    pattern = re.compile(
        r"""
        (?:
            ["'](?P<quoted_key>[^"']+)["']
            |
            (?P<plain_key>[A-Za-z_$][A-Za-z0-9_$]*)
        )
        \s*:\s*
        (?:
            "(?P<double>(?:\\.|[^"\\])*)"
            |
            '(?P<single>(?:\\.|[^'\\])*)'
        )
        """,
        re.VERBOSE | re.DOTALL
    )

    for match in pattern.finditer(obj_text):

        key = (
            match.group("quoted_key")
            or match.group("plain_key")
        )

        value = (
            match.group("double")
            if match.group("double") is not None
            else match.group("single")
        )

        result[key] = js_unescape(value)

    return result


def load_playlist():

    if not PLAYLIST.exists():

        log(
            "music-list.js tidak ditemukan."
        )

        return []

    text = PLAYLIST.read_text(
        encoding="utf-8"
    )

    start, end = find_playlist_array(text)

    array_text = text[
        start:end + 1
    ]

    object_texts = parse_js_strings(
        array_text
    )

    songs = []

    for obj in object_texts:

        try:
            song = parse_object(obj)

            if song:
                songs.append(song)

        except Exception as error:

            log(
                f"Gagal membaca object: {error}"
            )

    log(
        f"Playlist terbaca: {len(songs)} lagu"
    )

    return songs


# =========================================================
# WRITE PLAYLIST
# =========================================================

def js_quote(value):

    return json.dumps(
        str(value),
        ensure_ascii=False
    )


def song_to_js(song):

    lines = [
        "  {"
    ]

    preferred_order = [
        "name",
        "artist",
        "src",
        "cover",
        "type",
        "youtubeId",
        "requestedBy",
        "requestTime"
    ]

    keys = []

    for key in preferred_order:

        if key in song:
            keys.append(key)

    for key in song:

        if key not in keys:
            keys.append(key)

    for index, key in enumerate(keys):

        comma = "," if index < len(keys) - 1 else ""

        lines.append(
            f'    {js_quote(key)}: {js_quote(song[key])}{comma}'
        )

    lines.append("  }")

    return "\n".join(lines)


def save_playlist(songs):

    blocks = []

    for song in songs:

        blocks.append(
            song_to_js(song)
        )

    content = (
        "// Musik XI TKJ 1.\n"
        "// Playlist diperbarui otomatis oleh Music Bot.\n"
        "window.LOCAL_MUSIC = [\n"
        + ",\n".join(blocks)
        + "\n];\n"
    )

    PLAYLIST.write_text(
        content,
        encoding="utf-8"
    )

    log(
        "music-list.js berhasil diperbarui."
    )


# =========================================================
# OCR
# =========================================================

def clean(value):

    if not value:
        return ""

    value = value.replace(
        "\r",
        ""
    )

    value = re.sub(
        r"[ \t]+",
        " ",
        value
    )

    return value.strip()


def find_field(text, names):

    for line in text.splitlines():

        line = clean(line)

        if not line:
            continue

        for name in names:

            match = re.match(
                rf"^{re.escape(name)}\s*[:\-]\s*(.+)$",
                line,
                flags=re.IGNORECASE
            )

            if match:

                return clean(
                    match.group(1)
                )

    return ""


def parse_ocr(text):

    return {
        "student": find_field(
            text,
            [
                "Nama Siswa",
                "Nama"
            ]
        ),

        "title": find_field(
            text,
            [
                "Judul Lagu",
                "Judul"
            ]
        ),

        "artist": find_field(
            text,
            [
                "Nama Artis",
                "Artis",
                "Artist"
            ]
        ),

        "time": find_field(
            text,
            [
                "Waktu",
                "Jam",
                "Time"
            ]
        )
    }


def run_ocr(path):

    image = Image.open(path)

    if image.mode != "RGB":
        image = image.convert("RGB")

    # OCR dengan beberapa mode agar PNG request lebih mudah dibaca
    text = pytesseract.image_to_string(
        image,
        lang="eng",
        config="--psm 6"
    )

    return text


# =========================================================
# YOUTUBE
# =========================================================

def search_youtube(title, artist):

    if not YOUTUBE_API_KEY:

        raise RuntimeError(
            "YOUTUBE_API_KEY belum tersedia."
        )

    query = title

    if artist:
        query += " " + artist

    log(
        f"Mencari YouTube: {query}"
    )

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
            "User-Agent": "XI-TKJ1-MusicBot"
        }
    )

    with urlopen(
        request,
        timeout=30
    ) as response:

        data = json.loads(
            response.read().decode(
                "utf-8"
            )
        )

    items = data.get(
        "items",
        []
    )

    if not items:
        return None

    item = items[0]

    video_id = item.get(
        "id",
        {}
    ).get(
        "videoId"
    )

    if not video_id:
        return None

    snippet = item.get(
        "snippet",
        {}
    )

    thumbnails = snippet.get(
        "thumbnails",
        {}
    )

    cover = (
        thumbnails.get(
            "high",
            {}
        ).get("url")
        or
        thumbnails.get(
            "medium",
            {}
        ).get("url")
        or
        f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    )

    return {
        "videoId": video_id,
        "title": snippet.get(
            "title",
            title
        ),
        "channel": snippet.get(
            "channelTitle",
            artist or "Unknown"
        ),
        "cover": cover
    }


# =========================================================
# DUPLICATE
# =========================================================

def duplicate(songs, video_id):

    for song in songs:

        if song.get(
            "youtubeId"
        ) == video_id:

            return True

        src = str(
            song.get(
                "src",
                ""
            )
        )

        if video_id in src:

            return True

    return False


# =========================================================
# PROCESS PNG
# =========================================================

def process_png(path, songs, processed):

    file_hash = hashlib.sha256(
        path.read_bytes()
    ).hexdigest()

    if file_hash in processed:

        log(
            f"SKIP: {path.name} sudah diproses."
        )

        return False

    log(
        f"Memproses: {path.name}"
    )

    # -------------------------
    # OCR
    # -------------------------

    try:

        ocr_text = run_ocr(
            path
        )

    except Exception as error:

        log(
            f"OCR ERROR: {error}"
        )

        return False

    print(
        "\n----- HASIL OCR -----"
    )

    print(
        ocr_text
    )

    print(
        "---------------------\n"
    )

    request = parse_ocr(
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

    if not request["title"]:

        log(
            "Judul lagu tidak terbaca. "
            "PNG akan dicoba lagi pada run berikutnya."
        )

        return False

    # -------------------------
    # YouTube
    # -------------------------

    try:

        result = search_youtube(
            request["title"],
            request["artist"]
        )

    except Exception as error:

        log(
            f"YouTube API ERROR: {error}"
        )

        return False

    if not result:

        log(
            "Video YouTube tidak ditemukan."
        )

        return False

    video_id = result[
        "videoId"
    ]

    if duplicate(
        songs,
        video_id
    ):

        log(
            "Lagu sudah ada di playlist."
        )

        processed.add(
            file_hash
        )

        return False

    # -------------------------
    # ADD
    # -------------------------

    song = {
        "name": result["title"],
        "artist": result["channel"],
        "src": (
            "https://www.youtube.com/watch?v="
            + video_id
        ),
        "cover": result["cover"],
        "type": "youtube",
        "youtubeId": video_id
    }

    if request["student"]:

        song["requestedBy"] = (
            request["student"]
        )

    if request["time"]:

        song["requestTime"] = (
            request["time"]
        )

    songs.append(
        song
    )

    processed.add(
        file_hash
    )

    log(
        "BERHASIL:"
    )

    log(
        f"{result['title']} - "
        f"{result['channel']}"
    )

    return True


# =========================================================
# MAIN
# =========================================================

def main():

    log(
        "=========================================="
    )

    log(
        " XI TKJ 1 MUSIC BOT"
    )

    log(
        " Google Drive PNG -> OCR -> YouTube"
    )

    log(
        "=========================================="
    )

    if not YOUTUBE_API_KEY:

        raise RuntimeError(
            "Secret YOUTUBE_API_KEY tidak ditemukan."
        )

    processed = load_processed()

    songs = load_playlist()

    if not REQUEST_DIR.exists():

        log(
            "Folder drive_music_requests tidak ada."
        )

        return

    png_files = sorted(
        REQUEST_DIR.rglob("*.png")
    )

    if not png_files:

        log(
            "Tidak ada PNG request."
        )

        return

    log(
        f"Ditemukan {len(png_files)} PNG request."
    )

    changed = False

    for path in png_files:

        try:

            result = process_png(
                path,
                songs,
                processed
            )

            if result:
                changed = True

        except Exception as error:

            log(
                f"ERROR {path.name}: {error}"
            )

    if changed:

        save_playlist(
            songs
        )

    else:

        log(
            "Tidak ada perubahan playlist."
        )

    save_processed(
        processed
    )

    log(
        f"Playlist akhir: {len(songs)} lagu."
    )

    log(
        "Bot selesai."
    )


if __name__ == "__main__":
    main()
