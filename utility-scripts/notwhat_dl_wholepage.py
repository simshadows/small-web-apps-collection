#!/usr/bin/env python3

"""
Filename: notwhat_dl_wholepage.py
Author:   https://github.com/simshadows

Reads HTML source for a notwhat.cd torrent search page, parses all download links, and
opens them all on a web browser.
"""

import re
import html
from sys import stdin
from webbrowser import open_new_tab
from time import sleep

PATTERN = "<a href=\".+\" class=\"tooltip\" title=\"Download\">DL</a>"
SLICE_LEN_LEFT = len("<a href=\"")
SLICE_LEN_RIGHT = len("\" class=\"tooltip\" title=\"Download\">DL</a>")

buf = stdin.read()
result = re.findall(PATTERN, buf)

counter = 1
total = len(result)

print(f"Found {total} URLs.")
for match in result:
    url = html.unescape("https://notwhat.cd/" + str(match)[SLICE_LEN_LEFT:-SLICE_LEN_RIGHT])
    open_new_tab(url)

    print(f"Opened {counter} of {total}")
    counter += 1

    sleep(0.25) # Chrome hangs for a long time if you don't add a delay.
