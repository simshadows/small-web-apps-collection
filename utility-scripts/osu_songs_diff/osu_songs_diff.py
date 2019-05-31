#!/usr/bin/env python3

"""
Filename: osu_songs_diff.py
Author:   contact@simshadows.com

Diffs powershell 'ls' output of two osu! songs folders, and downloads the difference,
or prints out the difference.

Need to format the output using something like the following:
    ls | Format-Wide -Property Name -Column 1 | Out-File -FilePath ./songs.txt

Files should look like the following:

>
>
>10130 Within Temptation - The Howling                                 
>110554 Rise Against - Prayer of the Refugee     
>12823 Whiteberry - Natsu Matsuri                                      
>131682 Within Temptation - Stand My Ground                            
>1329 Finntroll - Trollhammaren   
>727256 Demetori - Shinkou wa Hakanaki Ningen no Tame ni _ Jehovah's YaHVeH                                                                
>739899 Symphony X - Seven                                             
>764052 Sonata Arctica - Revontulet                                    
>844658 Korpiklaani - A Man With A Plan                                
>912443 Xandria - Voyage Of The Fallen                                 
>songs.txt                                                             
>
>
>

(Tip: You can open a powershell window anywhere in Windows using Shift + Right-Click
in an Explorer window.)
"""

from sys import argv
import re
from webbrowser import open_new_tab
from time import sleep

_startnum = re.compile("^[0-9]+")

def get_songid_set_from_file(filename):
    s = set()
    with open(filename, "r", encoding="utf-16") as f:
        for line in f:
            matchobj = _startnum.match(line.strip())
            if matchobj != None:
                val = int(matchobj[0])
                if val in s:
                    print(f"WARNING: We shouldn't be seeing duplicates. Duplicate song ID {val} in file '{filename}'.")
                s.add(val)
    return s

def osu_songs_diff(filename1, filename2, *, dryrun):
    set1 = get_songid_set_from_file(filename1)
    set2 = get_songid_set_from_file(filename2)
    intersectionlen = len(set1 & set2)
    set1len = len(set1)
    set2len = len(set2)
    set1difflen = set1len - intersectionlen
    set2difflen = set2len - intersectionlen
    print(f"Found {set1len} song IDs in {filename1}. Contains {set1difflen} song IDs not found in {filename2}.")
    print(f"Found {set2len} song IDs in {filename2}. Contains {set2difflen} song IDs not found in {filename1}.")
    print(f"Both files contain {intersectionlen} song IDs in common.")
    diff = set2 - set1
    assert len(diff) == set2difflen
    if dryrun:
        print("Dryrun results:")
        for song_id in diff:
            print(f"    Song ID {song_id} would be downloaded.")
    else:
        for i, song_id in enumerate(diff, start=1):
            print(f"Downloading song ID {song_id} via. web browser ({i} of {set2difflen})...")
            open_new_tab(f"https://osu.ppy.sh/beatmapsets/{song_id}/download?noVideo=1")
            sleep(1) # Prevents browser hang-ups and Too Many Requests server errors. Adjust as needed.

def run():
    print("ARGS: " + str(argv))
    if len(argv) < 3:
        print("Usage: [--dryrun] file1 file2"
              "\n\nThis program will download the songs present in file2 that are"
              " not present in file1."
              "\n--dryrun will instead print the songs it would've downloaded.")
    if argv[1] == "--dryrun":
        osu_songs_diff(argv[2], argv[3], dryrun=True)
    else:
        osu_songs_diff(argv[1], argv[2], dryrun=False)

if __name__ == "__main__":
    run()
