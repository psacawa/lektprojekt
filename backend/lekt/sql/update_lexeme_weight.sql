--  lexeme l2 normalized tf-idf weights
--  params: base_lang_id, target_lang_id
INSERT INTO
  lekt_lexeme_weight (
    base_lang_id,
    target_lang_id,
    lexeme_id,
    phrasepair_id,
    weight
  )
SELECT
  %s,
  %s,
  lekt_lexeme_tf.lexeme_id,
  lekt_lexeme_tf.phrasepair_id,
  tf * idf AS weight
FROM
  lekt_lexeme_tf
  JOIN lekt_lexeme_idf ON (
    lekt_lexeme_tf.lexeme_id = lekt_lexeme_idf.lexeme_id
  ) on conflict on constraint lekt_lexemeweight_unique do
update
set
  weight = excluded.weight;
WITH l2_doc_norms AS (
  SELECT
    phrasepair_id,
    sqrt(sum(weight ^ 2)) AS norm
  FROM
    lekt_lexeme_weight
  WHERE
    base_lang_id = %s
    AND target_lang_id = %s
  GROUP BY
    phrasepair_id
)
UPDATE
  lekt_lexeme_weight
SET
  weight = weight / norm
FROM
  l2_doc_norms
WHERE
  l2_doc_norms.phrasepair_id = lekt_lexeme_weight.phrasepair_id
