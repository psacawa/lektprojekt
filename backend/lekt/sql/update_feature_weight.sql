--  feature l2 normalized tf-idf weights
--  params: base_lang_id, target_lang_id
INSERT INTO
  lekt_feature_weight (
    base_lang_id,
    target_lang_id,
    feature_id,
    phrasepair_id,
    weight
  )
SELECT
  %s,
  %s,
  lekt_feature_tf.feature_id,
  lekt_feature_tf.phrasepair_id,
  tf * idf AS weight
FROM
  lekt_feature_tf
  JOIN lekt_feature_idf ON (
    lekt_feature_tf.feature_id = lekt_feature_idf.feature_id
  ) on conflict on constraint lekt_featureweight_unique do
update
set
  weight = excluded.weight;
WITH l2_doc_norms AS (
  SELECT
    phrasepair_id,
    sqrt(sum(weight ^ 2)) AS norm
  FROM
    lekt_feature_weight
  where
    base_lang_id = %s
    AND target_lang_id = %s
  GROUP BY
    phrasepair_id
)
UPDATE
  lekt_feature_weight
SET
  weight = weight / norm
FROM
  l2_doc_norms
WHERE
  lekt_feature_weight.phrasepair_id = l2_doc_norms.phrasepair_id;
