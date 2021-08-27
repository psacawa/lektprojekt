--  inverse document frequencies
--  params: (base_lang_id, target_lang_id) x2
DROP TABLE IF EXISTS lekt_observable_idf;
CREATE UNLOGGED TABLE lekt_observable_idf AS (
  WITH lekt_doc_counts AS (
    SELECT
      count(*) AS n
    FROM
      lekt_phrasepair pp
      JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
      JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
    WHERE
      pp.active
      and bp.lang_id = %s
      and tp.lang_id = %s
  ),
  lekt_word_observables AS (
    SELECT
      word_id,
      l.observable_id
    FROM
      lekt_word w
      JOIN lekt_lexeme l ON (w.lexeme_id = l.observable_id)
    UNION
    SELECT
      word_id,
      f.observable_id
    FROM
      lekt_word w
      JOIN lekt_word_features wf USING (word_id)
      JOIN lekt_feature f ON (wf.feature_id = f.observable_id)
  ),
  lekt_phrasepair_observables AS (
    SELECT
      pp.phrasepair_id,
      observable_id
    FROM
      lekt_phrasepair pp
      JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
      JOIN lekt_phrase_words tpw USING (phrase_id)
      JOIN lekt_word_observables wo USING (word_id)
    WHERE
      pp.active
  )
  SELECT
    ppf.observable_id,
    ln((dc.n):: float / count(DISTINCT tp.phrase_id)) AS idf
  FROM
    lekt_phrasepair pp
    JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
    JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
    JOIN lekt_phrasepair_observables ppf ON (pp.phrasepair_id = ppf.phrasepair_id)
    cross JOIN lekt_doc_counts dc
  where
    pp.active
    and bp.lang_id = %s
    and tp.lang_id = %s
  GROUP BY
    bp.lang_id,
    tp.lang_id,
    ppf.observable_id,
    dc.n
);
