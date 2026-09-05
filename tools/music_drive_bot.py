import hashlib
import json
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageOps, ImageFilter
import pytesseract

ROOT = Path(__file__).resolve().parents[1]
REQUEST_DIR = ROOT / 'drive_music_requests'
STATE_FILE = ROOT / '.musicbot' / 'processed.json'
PLAYLIST_FILE = ROOT / 'music-list.js'
API_KEY = os.environ.get('YOUTUBE_API_KEY', '').strip()

if not API_KEY:
    raise SystemExit('YOUTUBE_API_KEY belum tersedia di GitHub Secrets.')

STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
try:
    processed = set(json.loads(STATE_FILE.read_text(encoding='utf-8')))
except Exception:
    processed = set()


def normalize(s: str) -> str:
    return re.sub(r'\s+', ' ', s.replace('\u200b', ' ')).strip()


def extract_field(text: str, label: str, next_labels):
    pattern = rf'{re.escape(label)}\s*:?\s*(.*?)(?=\s*(?:' + '|'.join(map(re.escape, next_labels)) + r')\s*:|$)'
    m = re.search(pattern, text, re.I | re.S)
    return normalize(m.group(1)) if m else ''


def ocr_png(path: Path) -> str:
    img = Image.open(path).convert('L')
    # Enlarge and improve contrast for screenshots/phone captures.
    img = img.resize((img.width * 2, img.height * 2))
    img = ImageOps.autocontrast(img)
    img = img.filter(ImageFilter.SHARPEN)
    return pytesseract.image_to_string(img, config='--psm 6', lang='eng')


def parse_request(text: str):
    # OCR may turn ':' into punctuation or add spaces, so match labels loosely.
    cleaned = normalize(text)
    cleaned = re.sub(r'(?i)Nama\s+Siswa\s*[-=]?\s*:', 'Nama Siswa:', cleaned)
    cleaned = re.sub(r'(?i)Judul\s+Lagu\s*[-=]?\s*:', 'Judul Lagu:', cleaned)
    cleaned = re.sub(r'(?i)Nama\s+Artis\s*[-=]?\s*:', 'Nama Artis:', cleaned)
    cleaned = re.sub(r'(?i)Waktu\s*[-=]?\s*:', 'Waktu:', cleaned)

    student = extract_field(cleaned, 'Nama Siswa', ['Judul Lagu', 'Nama Artis', 'Waktu'])
    title = extract_field(cleaned, 'Judul Lagu', ['Nama Artis', 'Waktu'])
    artist = extract_field(cleaned, 'Nama Artis', ['Waktu'])
    return student, title, artist


def load_playlist():
    if not PLAYLIST_FILE.exists():
        return []
    text = PLAYLIST_FILE.read_text(encoding='utf-8')
    marker = 'window.LOCAL_MUSIC = '
    start = text.find(marker)
    if start < 0:
        raise SystemExit('Format music-list.js tidak dikenali.')
    a = text.find('[', start)
    b = text.rfind('];')
    if a < 0 or b < 0:
        raise SystemExit('Array LOCAL_MUSIC tidak ditemukan.')
    return json.loads(text[a:b + 1])


def save_playlist(songs):
    header = '// Playlist YouTube XI TKJ 1.\n// Lagu dari request PNG disimpan sebagai metadata/video ID YouTube, bukan file MP3.\nwindow.LOCAL_MUSIC = '
    PLAYLIST_FILE.write_text(header + json.dumps(songs, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')


def youtube_search(query):
    params = urllib.parse.urlencode({
        'part': 'snippet',
        'q': query,
        'type': 'video',
        'maxResults': 1,
        'key': API_KEY,
    })
    with urllib.request.urlopen('https://www.googleapis.com/youtube/v3/search?' + params, timeout=30) as r:
        data = json.load(r)
    items = data.get('items', [])
    if not items:
        return None
    item = items[0]
    vid = item.get('id', {}).get('videoId')
    if not vid:
        return None
    sn = item.get('snippet', {})
    return {
        'name': sn.get('title', query),
        'artist': sn.get('channelTitle', ''),
        'src': f'https://www.youtube.com/watch?v={vid}',
        'cover': sn.get('thumbnails', {}).get('high', {}).get('url', ''),
        'type': 'youtube',
        'youtubeId': vid,
        'requestedBy': None,
    }

songs = load_playlist()
changed = False

for path in sorted(REQUEST_DIR.rglob('*.png')):
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    if digest in processed:
        continue

    print(f'\n=== Membaca request: {path.name} ===')
    try:
        raw = ocr_png(path)
        print(raw)
        student, title, artist = parse_request(raw)
        print(f'Siswa : {student}')
        print(f'Judul : {title}')
        print(f'Artis : {artist}')

        if not title:
            print('SKIP: Judul Lagu tidak terbaca.')
            continue

        query = f'{title} {artist}'.strip()
        result = youtube_search(query)
        if not result:
            print(f'SKIP: Tidak ditemukan di YouTube: {query}')
            processed.add(digest)
            continue

        if any(s.get('youtubeId') == result['youtubeId'] for s in songs):
            print('Lagu sudah ada di music-list.js.')
        else:
            result['requestedBy'] = student or 'Siswa'
            songs.append(result)
            changed = True
            print(f"DITAMBAHKAN: {result['name']} ({result['youtubeId']})")

        processed.add(digest)
    except Exception as exc:
        print(f'ERROR memproses {path.name}: {exc}')
        # Do not mark failed OCR/downloads as processed; the next run can retry.

if changed:
    save_playlist(songs)

STATE_FILE.write_text(json.dumps(sorted(processed), indent=2), encoding='utf-8')
print(f'\nSelesai. Request diproses: {len(processed)}. Playlist berubah: {changed}.')
