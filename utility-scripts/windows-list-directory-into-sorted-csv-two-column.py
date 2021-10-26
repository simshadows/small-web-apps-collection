#!/usr/bin/env python3

"""
Filename: windows-list-directory-into-sorted-csv-two-column.py
Author:   https://github.com/simshadows

For Windows only.

This script gets a full directory listing from Powershell, sorts the listing by filename,
then outputs it into a CSV file in a sort of "two-column format" containing file
sizes and file names.

(Yes, I realize this script is very hyperspecific in what it does. Yes, there's a
reason for it, but it's not worth talking about here.)
"""

import os
import csv
from io import StringIO
from subprocess import Popen, PIPE
from itertools import chain, zip_longest

OUTPUT_FILENAME = "output.csv"

def grouper(iterable, n, fillvalue=None):
    """
    Collect data into fixed-length chunks or blocks
    Source: <https://docs.python.org/3/library/itertools.html>
    """
    # grouper('ABCDEFG', 3, 'x') --> ABC DEF Gxx"
    args = [iter(iterable)] * n
    return zip_longest(*args, fillvalue=fillvalue)

with Popen('powershell.exe Get-ChildItem | Select-Object -Property Length,Name | ConvertTo-Csv', stdout=PIPE) as proc:
    proc.wait()
    with StringIO(proc.stdout.read().decode("utf-8")) as f:
        data = list(csv.reader(f))
        if data[:2] != [["#TYPE Selected.System.IO.FileInfo"], ["Length", "Name"]]:
            raise ValueError("Unexpected format.")
        data = data[2:]
        with open(OUTPUT_FILENAME, "w", newline="") as f2:
            writer_obj = csv.writer(f2)
            for tup in grouper(data, 2, fillvalue=["PLACEHOLDER", "PLACEHOLDER"]):
                writer_obj.writerow(list(chain(*tup)))
