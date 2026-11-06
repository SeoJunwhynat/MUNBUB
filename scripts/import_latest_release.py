#!/usr/bin/env python3
"""Import the attached latest frontend ZIP without overwriting the live Neon server.

Upload a ZIP named matchunbeom_latest.zip to branch migration/render-neon.
This utility copies only permitted frontend files; it rejects all other archive
members to prevent a stale Vercel Blob API from replacing the Render backend.
"""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, BadZipFile
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "matchunbeom_latest.zip"
ROOT_JS_CSS = re.compile(r"munbub_[A-Za-z0-9_.-]+\.(?:js|css)\Z")
CATALOG = re.compile(r"ui-assets/catalog/(?:[A-Za-z0-9_.-]+/)*[A-Za-z0-9_.-]+\.(?:png|json)\Z")
STATIC_WHITELIST = {
    "index.html",
    "idiom_final_100.json",
    "tests/idiom-final.test.mjs",
}

def accepted(name):
    return (name in STATIC_WHITELIST or
            ROOT_JS_CSS.fullmatch(name) is not None or
            CATALOG.fullmatch(name) is not None)

def main():
    if not ARCHIVE.is_file():
        raise SystemExit("No matchunbeom_latest.zip found. Nothing imported.")
    try:
        with ZipFile(ARCHIVE) as z:
            infos = [i for i in z.infolist() if not i.is_dir()]
            names = [i.filename for i in infos]
            if len(names) != len(set(names)):
                raise ValueError("Archive has duplicate filenames")
            if len(infos) < 160:
                raise ValueError("Archive is missing latest achievement/title assets")
            for info in infos:
                path = PurePosixPath(info.filename)
                if (path.is_absolute() or ".." in path.parts or
                    not accepted(info.filename)):
                    raise ValueError("Archive contains a forbidden path: " + info.filename)
                if info.file_size > 5 * 1024 * 1024:
                    raise ValueError("Unexpectedly large file: " + info.filename)

            required = {
                "index.html", "idiom_final_100.json",
                "tests/idiom-final.test.mjs",
                "munbub_catalog_ui_20261106.js",
                "munbub_catalog_ui_20261106.css",
                "munbub_idiom_bank_100.js",
                "ui-assets/catalog/catalog-manifest.json",
            }
            if not required.issubset(names):
                raise ValueError("Required files missing: " + str(required - set(names)))

            manifest = json.loads(z.read("ui-assets/catalog/catalog-manifest.json"))
            if len(manifest.get("achievements", [])) != 45:
                raise ValueError("Expected 45 achievements")
            if len(manifest.get("titles", [])) != 11:
                raise ValueError("Expected 11 titles")
            for category in ("achievements", "titles"):
                for entry in manifest[category]:
                    for asset in entry.get("images", {}).values():
                        if not asset:
                            continue
                        asset_path = str(asset).lstrip("/")
                        if asset_path not in names:
                            raise ValueError("Missing UI asset: " + asset_path)
            idioms = json.loads(z.read("idiom_final_100.json"))
            if len(idioms) != 100 or len({x["id"] for x in idioms}) != 100:
                raise ValueError("Invalid final idiom bank")
            index = z.read("index.html").decode("utf-8")
            if ("munbub_catalog_ui_20261106.css" not in index or
                "munbub_catalog_ui_20261106.js" not in index):
                raise ValueError("Game homepage does not load the new catalog")
            # A single source of truth: the browser's 100 idioms match the server's.
            idiom_js = z.read("munbub_idiom_bank_100.js").decode("utf-8")
            data_match = re.search(r"const entries=(\[.*?\]);", idiom_js, re.S)
            if not data_match or json.loads(data_match.group(1)) != idioms:
                raise ValueError("Client and server idioms disagree")

            for info in infos:
                destination = ROOT / info.filename
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(z.read(info))
            print("Imported", len(infos), "latest game files; protected API, Neon",
                  "storage, Render server, credentials and redirects untouched.")
    except (BadZipFile, OSError, ValueError) as exc:
        raise SystemExit("Import refused: " + str(exc))

if __name__ == "__main__":
    main()
