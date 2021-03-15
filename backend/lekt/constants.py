verb_description_dict = {
    "ADJ": "adjective",
    "ADP": "adposition",
    "ADV": "adverb",
    "AUX": "auxiliary",
    #  "CCONJ": "coordinating conjunction",
    "CCONJ": "conjunction",
    "DET": "determiner",
    "INTJ": "interjection",
    "NOUN": "noun",
    "NUM": "numeral",
    "PART": "particle",
    "PRON": "pronoun",
    "PROPN": "proper noun",
    "PUNCT": "punctuation",
    #  "SCONJ": "subordinating conjunction",
    "SCONJ": "conjunction",
    "SYM": "symbol",
    "VERB": "verb",
}

#  used as choices for Lexeme.pos field
lexeme_pos_choices = [(k, v) for (k, v) in verb_description_dict.items()]
