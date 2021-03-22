#!/usr/bin/env python3

import asyncio
import configparser
import logging
import re
import sqlite3
from hashlib import md5, sha256
from os.path import expanduser
from random import random

import aiobotocore
from progress.bar import Bar

logger = logging.getLogger("s3_rename")
logger.setLevel(logging.DEBUG)
handler = logging.FileHandler(filename="rename.log")
handler.setLevel(logging.DEBUG)
logger.addHandler(handler)

PHRASE_DB = "../backend/assets/spanishdict.sqlite"
BUCKET = "lektprojekt-audio"
config = configparser.ConfigParser()
config.read(expanduser("~/.aws/credentials"))

AWS_ACCESS_KEY_ID = config["default"]["aws_access_key_id"]
AWS_SECRET_ACCESS_KEY = config["default"]["aws_secret_access_key"]


def hash_filename(voice: str, text: str, hash_algorithm=sha256):
    """Stupid hash filename I used"""
    key = bytes(f"{voice}{text}", "utf-8")
    hash_value = hash_algorithm(key).hexdigest()
    return "{}.mp3".format(hash_value)


async def rename_worker(queue: asyncio.Queue, client):
    while True:
        old_file, voice, text = await queue.get()
        new_text = re.sub(r"[^\w]+", "-", text)
        #  print(f"moved s3://{BUCKET}/{old_file} to {voice}/{new_text}.mp3")
        #  shape of copy API is stupid
        await client.copy_object(
            CopySource={"Bucket": BUCKET, "Key": old_file},
            Bucket=BUCKET,
            Key=f"{voice}/{new_text}.mp3",
        )
        progress.next()
        queue.task_done()


async def download_old_files(outfile="old.files"):
    """download the list of all sha256 formatted mp3 files to old.files"""
    session = aiobotocore.get_session()
    async with session.create_client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    ) as s3:
        paginator = s3.get_paginator("list_objects_v2")
        old_files = open("old.files", "w")
        async for result in paginator.paginate(Bucket=BUCKET, Prefix="audio"):
            for c in result.get("Contents", None):
                if re.match(r"audio/[0-9a-f]{64}\.mp3", c["Key"]):
                    old_files.write(c["Key"] + "\n")


async def main():
    queue = asyncio.Queue()

    conn = sqlite3.connect(f"file:{PHRASE_DB}", uri=True)
    old_files = set(open("old.files").read().splitlines())
    pairs = conn.execute("select lang1, lang2 from phrases")

    session = aiobotocore.get_session()
    async with session.create_client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    ) as s3:
        for pair in pairs:
            for (voice, text) in [("Joanna", pair[0]), ("Lucia", pair[1])]:
                filename = "audio/" + hash_filename(voice, text)
                if filename not in old_files:
                    logger.error(f"didn't find {filename=} {voice=} {text=} ")
                    continue
                queue.put_nowait((filename, voice, text))

        global progress
        progress = Bar("Renaming S3 audio files", maxsize=queue.qsize())

        tasks = [asyncio.create_task(rename_worker(queue, s3)) for _ in range(1000)]
        await queue.join()
        for task in tasks:
            task.cancel()


if __name__ == "__main__":
    asyncio.run(main(), debug=True)
