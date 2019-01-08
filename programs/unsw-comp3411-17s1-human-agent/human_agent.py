#!/usr/bin/env python3

"""
human_agent.py
author: https://github.com/simshadows
course: UNSW COMP3411 (Artificial Intelligence) 17s1

A human-controlled agent for the Treasure Hunt assignment.

Practically functionally equivalent to the officially supplied Agent.java, but exceptions
aren't caught.

PLAGIARISM WARNING:
When I did the course, we were permitted to distribute our own human agent programs such
as this one, with the idea being that other students would then build their own game-playing
AI on top of it. I expect that this shouldn't be a problem in future offerings of COMP3411,
but I suggest you double-check anyway before using this for an assignment.
"""

from sys import argv
from socket import create_connection

FWIDTH, FHEIGHT = 5, 5 # Field Dimensions
RECV_HALFLEN = int(((FWIDTH * FHEIGHT) - 1) / 2)
assert (FWIDTH % 2 == 1) and (FHEIGHT % 2 == 1)

def get_action():
    while True:
        ch = input("Enter Action(s): ").lower()
        if ch in {"l", "r", "f", "c", "b", "u"}:
            return ch

def print_view(view):
    print("\n+-----+")
    print("\n".join("|" + x.decode("utf-8") + "|" for x in view))
    print("+-----+")

def main(port):
    try:
        with create_connection(("localhost", port)) as sock:
            while True:
                buf = b"".join(sock.recv(1) for _ in range(RECV_HALFLEN))
                buf += b"^" + b"".join(sock.recv(1) for _ in range(RECV_HALFLEN))
                if len(buf) != FWIDTH * FHEIGHT:
                    raise ConnectionError("Unexpected data size. Socket probably closed.")
                view = [buf[FWIDTH*x:FWIDTH*(x+1)] for x in range(FHEIGHT)] # Cut equal slices
                print_view(view)
                action = get_action()
                sock.send(action.encode())
    finally:
        print(f"\nLost connection to port: {port}\n")

if __name__ == "__main__":
    _port = int(argv[2]) # Good enough arg parsing
    main(_port)
