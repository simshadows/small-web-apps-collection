#!/usr/bin/env python3

"""
Filename: hellobot.py
Author:   https://github.com/simshadows

This is the minimal version, designed to respond to users when they say "!hello".

To run the bot, find and replace "PASTE_YOUR_TOKEN_HERE" with your API token.
For example, if your token is abc123abc123abc123, the line should look like:
    client.run("abc123abc123abc123")
"""

from discord import Client

class CustomClient(Client):

    async def on_ready(self):
        print(f"Logged in as {self.user.name}, with User ID {self.user.id}.")
        return

    async def on_message(self, msg):
        if msg.content == "!hello":
            await self.send_message(msg.channel, "Hello, World!")
        return

client = CustomClient()
client.run("PASTE_YOUR_TOKEN_HERE")
