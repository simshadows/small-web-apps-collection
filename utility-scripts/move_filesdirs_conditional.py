#!/usr/bin/env python3

"""
Filename: move_filesdirs_conditional.py
Author:   https://github.com/simshadows

Moves items from the root of SRC_DIR to the root of DST_DIR if they meet the
condition of to_be_moved().

In the case below, it moves an item if:
    A) the item is a directory, and
    B) the directory contains at least one ".mp3" file.
Simply modify the function to suit a particular need.
"""

import os
import sys
import shutil

SRC_DIR = "."
DST_DIR = "../foo"

def run(src_dir, dst_dir):
    for filename in os.listdir(path=src_dir):
        old_path = os.path.join(src_dir, filename)
        if to_be_moved(old_path):
            new_path = os.path.join(dst_dir, filename)
            shutil.move(old_path, new_path)
    return

def to_be_moved(basepath):
    if not os.path.isdir(basepath):
        return False
    for dirpath, dirnames, filenames in os.walk(basepath):
        if any(filename.lower().endswith(".mp3") for filename in filenames):
            return True
    return False

if __name__ == "__main__":
    run(SRC_DIR, DST_DIR)
