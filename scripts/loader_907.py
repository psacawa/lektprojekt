#!/usr/bin/env python3
import argparse
import sqlite3
import subprocess
from glob import glob
from json import loads
from os.path import dirname, isdir, isfile, join

from jq import jq


def main():
    global ASSET_DIR
    global voice_map
    parser = argparse.ArgumentParser(
        description="""Load all tsv files representing parallel corpora from List 907 by
        CK (CC BY) on tatoeba.org in a specified folder into sqlite database files."""
    )
    parser.add_argument(
        "target", help="TSV file containing phrases or folder with such phrases"
    )
    parser.add_argument(
        "-r",
        "--reload",
        help="Reload all SQLite files",
        default=False,
        action="store_true",
    )
    args = parser.parse_args()
    target = args.target
    if isfile(target):
        ASSET_DIR = dirname(target)
    elif isdir(target):
        ASSET_DIR = target
    else:
        raise NotADirectoryError(target)
    voice_map = get_voices()

    if isfile(target):
        transform_tsv(target, reload=args.reload)
    else:
        for file in glob(join(target, "*907*.tsv")):
            transform_tsv(file, reload=args.reload)


def get_voices():
    """Obtain mapping of languages to lid from voices.json"""
    voices_file = join(ASSET_DIR, "voices.json")
    voices_json = loads(open(voices_file).read())
    tuples = jq(".Voices[]|[.LanguageName, .LanguageCode[:2]]").input(voices_json).all()
    # preprocess language name
    language_map = {k.split(" ")[-1].lower(): v for [k, v] in tuples}
    language_map["lithuanian"] = "lt"
    language_map["mandarin"] = "zh"
    language_map["finnish"] = "fi"
    return language_map


def transform_tsv(tsv_file, reload=False):
    print(tsv_file)
    data = [row.strip().split("\t")[1:3] for row in open(tsv_file).readlines()]

    # find out the language by manual inspection (ask the user)
    print(f"Target: {data[0][1]}")
    try:
        lang = input("Identify target language: ")
    except KeyboardInterrupt as e:
        print("Skipping...")
        return
    sqlite_file = join(ASSET_DIR, f"list907{lang}.sqlite")
    if isfile(sqlite_file):
        if reload:
            subprocess.run(["rm", sqlite_file])
        else:
            print("SQLite already present.")
            return
    conn = sqlite3.connect(f"file:{sqlite_file}", uri=True)
    conn.execute(
        """CREATE TABLE meta(lang1 text not null, lang2 text not null, 
        name text not null, domain text, notes text);"""
    )
    conn.execute(
        """CREATE TABLE "phrases" (
        "index" INTEGER primary key,
          "lang1" TEXT,
          "lang2" TEXT
        );"""
    )

    conn.execute(
        "insert into meta values (?, ?, ?, ?, ?);",
        (
            "en",
            voice_map[lang],
            f"TatoebaList907{lang}",
            "tatoeba.org",
            "CC-BY, quality\
                is spotty at times, original corpus is starshaped around the base \
                langauge English",
        ),
    )
    conn.executemany("insert into phrases (lang1, lang2) values (?,?)", data)
    conn.commit()
    conn.close()


if __name__ == "__main__":
    main()
