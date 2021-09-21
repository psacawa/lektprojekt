--  lexeme inverse document frequencies
--  params: base_lang_id, target_lang_id, base_lang_id, target_lang_id
DROP TABLE IF EXISTS lekt_lexeme_idf;
CREATE UNLOGGED TABLE lekt_lexeme_idf AS (
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
  )
  SELECT
    tw.lexeme_id,
    ln(dc.n:: float / count(DISTINCT tp.phrase_id)) AS idf
  FROM
    lekt_phrasepair pp
    JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
    JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
    JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
    JOIN lekt_word tw ON (tpw.word_id = tw.word_id)
    cross JOIN lekt_doc_counts dc
  WHERE
    pp.active
    and bp.lang_id = %s
    and tp.lang_id = %s
  GROUP BY
    bp.lang_id,
    tp.lang_id,
    tw.lexeme_id,
    dc.n
);