#!/usr/bin/env python3

"""
Filename: util1_mass_music_folder_rename.py
Author:   https://github.com/simshadows

Renames folders at the root of WORKING_DIR in a specific format, with values taken from
audio file tags.

This is a very crude script and is expected to be single-use only.
"""

import os
import sys
import shutil
import mutagen
import random
import string
from traceback import print_exc

WORKING_DIR = "."
DST_DIR = "../foo"

def run(working_dir, dst_dir):
    for fso_name in os.listdir(path=working_dir):
        fso_path = os.path.join(working_dir, fso_name)
        if os.path.isdir(fso_path):
            try:
                renaming_params, mutaf = get_renaming_parameters(fso_path)
            except:
                print("Failed to get renaming parameters.")
                print_exc()
                print("\n\n")
                continue
            try:
                perform_directory_rename(fso_name, renaming_params, working_dir, dst_dir, mutaf)
            except:
                print("Failed to rename.")
                print_exc()
                print("\n\n")
    return

def get_renaming_parameters(basepath):
    album_artist = None
    year = None
    album = None
    for dirpath, dirnames, filenames in os.walk(basepath):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)
            mutaf = mutagen.File(filepath)
            print(f"RAW MUTAF: {mutaf}")
            if mutaf is not None:
                if mutaf.tags is not None:
                    mutaf = mutaf.tags
                ktrans = {k.lower(): k for k, v in mutaf.items()}
                if ("albumartist" in ktrans) and (mutaf[ktrans["albumartist"]][0] != ""):
                    new_album_artist = mutaf[ktrans["albumartist"]]
                    if album_artist is None:
                        album_artist = new_album_artist
                    elif album_artist != new_album_artist:
                        album_artist = ["[[[MIXED ARTISTS]]]",]
                elif ("album artist" in ktrans) and (mutaf[ktrans["album artist"]][0] != ""):
                    new_album_artist = mutaf[ktrans["album artist"]]
                    if album_artist is None:
                        album_artist = new_album_artist
                    elif album_artist != new_album_artist:
                        album_artist = ["[[[MIXED ARTISTS]]]",]
                elif "artist" in ktrans:
                    new_album_artist = mutaf[ktrans["artist"]]
                    if album_artist is None:
                        album_artist = new_album_artist
                    elif album_artist != new_album_artist:
                        album_artist = ["[[[MIXED ARTISTS]]]",]
                if "date" in ktrans:
                    new_year = mutaf[ktrans["date"]]
                    if year is None:
                        year = new_year
                    elif year != new_year:
                        year = ["UNKNOWN YEAR",]
                if "album" in ktrans:
                    new_album = mutaf[ktrans["album"]]
                    if album is None:
                        album = new_album
                    elif album != new_album:
                        assert len(new_album) == 1
                        album = [new_album[0] + " [[[MIXED ALBUM NAMES]]]",]
    
    if year is None:
        year = ["UNKNOWN YEAR",]
    return ((album_artist, year, album), mutaf)

def perform_directory_rename(dirname, renaming_params, src_dir, dst_dir, mutaf):
    if not all(isinstance(x, list)
            and (len(x) == 1)
            and isinstance(x[0], str)
            and (len(x[0]) > 0)
            for x in renaming_params):
        raise ValueError(f"Bad renaming parameters.\nDir: {dirname}\nRenaming Parameters: {renaming_params}")
    album_artist, year, album = (x[0] for x in renaming_params)

    # Dummy rename
    new_dirname = f"{album_artist} ({year}) - {album}"

    replacers = [("/", "-"), ("\\", "-"), (":", "-"), ("*","_"), ("?", "_"), ("\"", "''"), ("<", "{"), (">", "}"), ("|", "-")]
    for old, new in replacers:
        new_dirname = new_dirname.replace(old, new)
    
    old_path = os.path.join(src_dir, dirname)
    new_path = os.path.join(dst_dir, new_dirname)

    while os.path.exists(new_path):
        print("FOUND DUPLICATE FSO NAME.")
        new_path += " (DUPLICATE)"
    shutil.move(old_path, new_path)
    return

if __name__ == "__main__":
    run(WORKING_DIR, DST_DIR)
