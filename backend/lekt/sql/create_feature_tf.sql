--  feature term frequencies
--  params: base_lang_id, target_lang_id
DROP TABLE IF EXISTS lekt_feature_tf;
CREATE UNLOGGED TABLE lekt_feature_tf AS (
  SELECT
    twf.feature_id,
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
    twf.feature_id,
    pp.phrasepair_id
);
ALTER TABLE
  lekt_feature_tf
ADD
  PRIMARY KEY (feature_id, phrasepair_id);
