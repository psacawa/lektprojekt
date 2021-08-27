#  This SQL script populates the tables lekt_lexeme_weight, lekt_feature_weight, and
#  lekt_observable_weight which contain tf-idf weights for lexemes, features, and all
#  linguistic observables respectively. It does so separately for each language pair, and
#  also creates an index that allows these tables to be searched quickly.
#  It's run from  compute_search_weights, which itself is run after a
#  load_corpus operation.

#  The script operates as follows:
#  1. Compute the term frequencies (tf) for lexemes in phrase pairs
#  2. Compute the document frequencies (df) for them.
#  3. Compute the inverse document frequencies (idf) following the formulas
#      idf_t = log (N/df_t), where N is the number of documents (phrase pairs)
#  4. Compute the tf-idf weights via wt_{t,d} = tf_{t,d} * idf_{t}
#  5. For each phrase pair d, normalize wt_{*,d} so that it's a normal vector. Since
#      relevancy scoring with tf-idf depends on computing the cosine similarity of the
#      query and document, by normalizing the document, one can get away with a dot
#      product, which can be implement with a simple SQL aggregate SUM operation.
#  6. (Re)create an index to search first by language pair, then by lexeme_id quickly
#  7. Repeat steps 1-5 for features, etc. and then finally for all observables considered
#      as a whole.

#  See [Manning, Raghavan, Schutze] for background on tf-idf relevancy in information
#  retrieval systems.

#  TODO 10/01/20 psacawa: it will be necessary to refactor this to take the language pair
#  as an argument when working with large datasets. Also to make it more comprehensible

import logging
import sys
from argparse import ArgumentParser
from operator import xor
from os.path import join
from typing import Optional, Set, Tuple

from django.conf import settings
from django.core.management import BaseCommand
from django.db import connection
from psycopg2.extras import DictCursor

from lekt.models import Corpus, Language

logger = logging.getLogger(__name__)

create_lexeme_idf = open("lekt/sql/create_lexeme_idf.sql").read()
create_lexeme_tf = open("lekt/sql/create_lexeme_tf.sql").read()
update_lexeme_weight = open("lekt/sql/update_lexeme_weight.sql").read()

create_feature_idf = open("lekt/sql/create_feature_idf.sql").read()
create_feature_tf = open("lekt/sql/create_feature_tf.sql").read()
update_feature_weight = open("lekt/sql/update_feature_weight.sql").read()

create_observable_idf = open("lekt/sql/create_observable_idf.sql").read()
create_observable_tf = open("lekt/sql/create_observable_tf.sql").read()
update_observable_weight = open("lekt/sql/update_observable_weight.sql").read()


class Command(BaseCommand):
    help = """
    (Re)compute tf-idf weights for relevancy search. This powers all views that depend on
    searching phrase pairs for a large number of features present in them.
    """

    cursor: DictCursor

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument("base_lid", nargs="?")
        parser.add_argument("target_lid", nargs="?")
        parser.add_argument("-b", "--both-ways", action="store_true")

    def handle(  # type: ignore
        self,
        base_lid: Optional[str],
        target_lid: Optional[str],
        both_ways: bool,
        *args,
        **kwargs,
    ):
        """If languages are specified, weights are computed for those corporum.
        Otherwise, do them all"""
        if xor(base_lid is None, target_lid is None):
            print("Need both base and taget lid")
            sys.exit(1)

        with connection.cursor() as cursor:
            self.cursor = cursor
            if base_lid and target_lid:
                self.handle_language_pair(base_lid, target_lid, both_ways)
            else:
                response = input("Really recompute ALL search weights?[Y/n] ")
                if response == "" or response.lower() == "y":
                    lid_pairs: Set[Tuple[str, str]] = set()
                    for corpus in Corpus.objects.prefetch_related("languages"):
                        lids = [l["lid"] for l in corpus.languages.values("lid")]
                        lid_pairs.add(tuple(sorted(lids)))  # type: ignore

                    for pair in lid_pairs:
                        self.handle_language_pair(*pair, True)

    def handle_language_pair(self, base_lid: str, target_lid: str, swap: bool):
        """(Re)compute the search weights for those corpora that deal with a given
        language pair. This is not a symmtric operation.
        You must run it twice with arguements switched"""
        while True:
            print(f"Computing search weights for {base_lid}->{target_lid}")
            base_lang_id = Language.objects.get(lid=base_lid).id
            target_lang_id = Language.objects.get(lid=target_lid).id
            self._compute_lexeme_weights(base_lang_id, target_lang_id)
            self._compute_feature_weights(base_lang_id, target_lang_id)
            self._compute_observable_weights(base_lang_id, target_lang_id)

            #  this just implements the --both-ways parmeter
            if swap:
                base_lid, target_lid = target_lid, base_lid
                swap = False
                continue
            break

    def _compute_lexeme_weights(self, base_lang_id: int, target_lang_id: int):
        logger.info("Lexeme search weights...")
        logger.debug("Computing lexeme term frequencies...")
        self._create_lexeme_tf(base_lang_id, target_lang_id)
        logger.debug("Computing lexeme inverse term frequencies...")
        self._create_lexeme_idf(base_lang_id, target_lang_id)
        logger.debug("Computing lexeme weights...")
        self._update_lexeme_weight(base_lang_id, target_lang_id)

    def _compute_feature_weights(self, base_lang_id: int, target_lang_id: int):
        logger.info("Feature search weights...")
        logger.debug("Computing feature term frequencies...")
        self._create_feature_tf(base_lang_id, target_lang_id)
        logger.debug("Computing feature inverse term frequencies...")
        self._create_feature_idf(base_lang_id, target_lang_id)
        logger.debug("Computing feature weights...")
        self._update_feature_weight(base_lang_id, target_lang_id)

    def _compute_observable_weights(self, base_lang_id: int, target_lang_id: int):
        logger.info("Observable search weights...")
        logger.debug("Computing observable term frequencies...")
        self._create_observable_tf(base_lang_id, target_lang_id)
        logger.debug("Computing observable inverse term frequencies...")
        self._create_observable_idf(base_lang_id, target_lang_id)
        logger.debug("Computing observable weights...")
        self._update_observable_weight(base_lang_id, target_lang_id)

    #  below we use plain string formatting of sql queries.
    #  these are not user-facing, and of restricted type, so this is acceptable

    #  LEXEME
    def _create_lexeme_tf(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(create_lexeme_tf % (base_lang_id, target_lang_id))

    def _create_lexeme_idf(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            create_lexeme_idf,
            (base_lang_id, target_lang_id, base_lang_id, target_lang_id),
        )

    def _update_lexeme_weight(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            update_lexeme_weight
            % (base_lang_id, target_lang_id, base_lang_id, target_lang_id),
        )

    #  FEATURE
    def _create_feature_tf(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(create_feature_tf % (base_lang_id, target_lang_id))

    def _create_feature_idf(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            create_feature_idf
            % (base_lang_id, target_lang_id, base_lang_id, target_lang_id),
        )

    def _update_feature_weight(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            update_feature_weight
            % (base_lang_id, target_lang_id, base_lang_id, target_lang_id),
        )

    #  OBSERVABLE
    def _create_observable_tf(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            create_observable_tf
            % (base_lang_id, target_lang_id, base_lang_id, target_lang_id)
        )

    def _create_observable_idf(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            create_observable_idf
            % (base_lang_id, target_lang_id, base_lang_id, target_lang_id),
        )

    def _update_observable_weight(self, base_lang_id: int, target_lang_id: int):
        self.cursor.execute(
            update_observable_weight
            % (base_lang_id, target_lang_id, base_lang_id, target_lang_id),
        )
