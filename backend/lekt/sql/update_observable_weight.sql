--  term frequencies
--  params: base_lang_id, target_lang_id
INSERT INTO
  lekt_observable_weight (
    base_lang_id,
    target_lang_id,
    observable_id,
    phrasepair_id,
    weight
  )
SELECT
  %s,
  %s,
  ftf.observable_id,
  ftf.phrasepair_id,
  ftf.tf * fidf.idf AS weight
FROM
  lekt_observable_tf ftf
  JOIN lekt_observable_idf fidf ON (ftf.observable_id = fidf.observable_id) on conflict on constraint lekt_observableweight_unique do
update
set
  weight = excluded.weight;
;
--  FIXME 27/08/20 psacawa: this still normalizes the whole table, which is wasteful
WITH l2_doc_norms AS (
  SELECT
    phrasepair_id,
    sqrt(sum(weight ^ 2)) AS norm
  FROM
    lekt_observable_weight
  where
    base_lang_id = %s
    AND target_lang_id = %s
  GROUP BY
    phrasepair_id
)
UPDATE
  lekt_observable_weight
SET
  weight = weight / norm
FROM
  l2_doc_norms n
WHERE
  lekt_observable_weight.phrasepair_id = n.phrasepair_id;
