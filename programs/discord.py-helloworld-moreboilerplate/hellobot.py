#!/usr/bin/env python3

"""
Filename: hellobot.py
Author:   https://github.com/simshadows

This file adds boilerplate code. This shouldn't be needed unless you're interested in
controlling the lower-level behaviour of your program.

As such, this file is not intended for beginners.

To run the bot, find and replace "PASTE_YOUR_TOKEN_HERE" with your API token.
"""

import sys
import asyncio

from discord import Client # python3 -m pip install -U discord.py[voice]


# TODO: Set up logging.


class CustomClient(Client):

    async def on_ready(self):
        print(f"Logged in as {self.user.name}, with User ID {self.user.id}.")
        return

    async def on_message(self, msg):
        if msg.content == "!hello":
            await self.send_message(msg.channel, "Hello, World!")
        return


async def start_client():
    client = CustomClient()
    await client.login("PASTE_YOUR_TOKEN_HERE")
    await client.connect()
    return


def run():
    print("Starting...")
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(start_client())
    finally:
        try:
            loop.close()
        except:
            pass
    return 0

if __name__ == '__main__':
    sys.exit(run())
