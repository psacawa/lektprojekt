--  term frequencies
--  params: (base_lang_id, target_lang_id) x2
-- all tables here are essentially unions of the analogues above for single types of
-- observables. The keys used to identify them are from lekt_observable table
DROP TABLE IF EXISTS lekt_observable_tf;
CREATE UNLOGGED TABLE lekt_observable_tf AS (
  SELECT
    tw.lexeme_id as observable_id,
    pp.phrasepair_id,
    count(*) AS tf
  FROM
    lekt_phrasepair pp
    JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
    JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
    JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
    JOIN lekt_word tw ON (tpw.word_id = tw.word_id)
  WHERE
    pp.active
    and bp.lang_id = %s
    and tp.lang_id = %s
  GROUP BY
    observable_id,
    pp.phrasepair_id
  UNION
  SELECT
    twf.feature_id as observable_id,
    pp.phrasepair_id,
    count(*) AS tf
  FROM
    lekt_phrasepair pp
    JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
    JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
    JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
    JOIN lekt_word_features twf ON (tpw.word_id = twf.word_id)
  WHERE
    pp.active
    and bp.lang_id = %s
    and tp.lang_id = %s
  GROUP BY
    observable_id,
    pp.phrasepair_id
);
ALTER TABLE
  lekt_observable_tf
ADD
  PRIMARY KEY (
    observable_id,
    phrasepair_id
  );
