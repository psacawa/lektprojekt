--
--  term frequencies
--

DROP TABLE IF EXISTS lekt_lexeme_tf;

CREATE UNLOGGED TABLE lekt_lexeme_tf AS (
    SELECT
        bp.lang_id AS base_lang_id,
        tp.lang_id AS target_lang_id,
        tl.lexeme_id,
        pp.phrasepair_id,
        count(*
) AS tf
    FROM
        lekt_phrasepair pp
        JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
        JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
        JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
        JOIN lekt_word tw ON (tpw.word_id = tw.word_id)
        JOIN lekt_lexeme tl ON (tw.lexeme_id = tl.lexeme_id)
    WHERE
        pp.active
    GROUP BY
        base_lang_id,
        target_lang_id,
        tl.lexeme_id,
        pp.phrasepair_id
);

ALTER TABLE lekt_lexeme_tf
    ADD PRIMARY KEY (base_lang_id, target_lang_id, lexeme_id, phrasepair_id);

--
--  inverse document frequencies
--

DROP TABLE IF EXISTS lekt_lexeme_idf;

CREATE UNLOGGED TABLE lekt_lexeme_idf AS (
    WITH lekt_doc_counts AS (
    SELECT
        bp.lang_id AS base_lang_id,
        tp.lang_id AS target_lang_id,
        count(*) AS n
    FROM
        lekt_phrasepair pp
        JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
        JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
    WHERE
        pp.active
    GROUP BY
        base_lang_id,
        target_lang_id
)
    SELECT
        bp.lang_id AS base_lang_id,
        tp.lang_id AS target_lang_id,
        tl.lexeme_id,
        ln(dc.n::float / count(DISTINCT tp.phrase_id)
) AS idf
    FROM
        lekt_phrasepair pp
        JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
        JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
        JOIN lekt_doc_counts dc ON (bp.lang_id = dc.base_lang_id AND tp.lang_id = dc.target_lang_id)
        JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
        JOIN lekt_word tw ON (tpw.word_id = tw.word_id)
        JOIN lekt_lexeme tl ON (tw.lexeme_id = tl.lexeme_id)
    WHERE
        pp.active
    GROUP BY
        bp.lang_id,
        tp.lang_id,
        dc.n,
        tl.lexeme_id
);

--
--  l2 normalized tf-idf scores
--

DROP TABLE IF EXISTS lekt_lexeme_weight;

CREATE TABLE lekt_lexeme_weight (
    id serial PRIMARY KEY,
    base_lang_id integer,
    target_lang_id integer,
    lexeme_id integer,
    phrasepair_id integer,
    weight double precision
);

INSERT INTO lekt_lexeme_weight (base_lang_id, target_lang_id, lexeme_id, phrasepair_id, weight)
SELECT
    lekt_lexeme_tf.base_lang_id,
    lekt_lexeme_tf.target_lang_id,
    lekt_lexeme_tf.lexeme_id,
    lekt_lexeme_tf.phrasepair_id,
    tf * idf AS weight
FROM
    lekt_lexeme_tf
    JOIN lekt_lexeme_idf ON (lekt_lexeme_tf.base_lang_id = lekt_lexeme_idf.base_lang_id
            AND lekt_lexeme_tf.target_lang_id = lekt_lexeme_idf.target_lang_id
            AND lekt_lexeme_tf.lexeme_id = lekt_lexeme_idf.lexeme_id);

WITH l2_doc_norms AS (
    SELECT
        base_lang_id,
        target_lang_id,
        phrasepair_id,
        sqrt(sum(weight ^ 2)) AS norm
    FROM
        lekt_lexeme_weight
    GROUP BY
        base_lang_id,
        target_lang_id,
        phrasepair_id)
UPDATE
    lekt_lexeme_weight
SET
    weight = weight / norm
FROM
    l2_doc_norms
WHERE
    lekt_lexeme_weight.base_lang_id = l2_doc_norms.base_lang_id
    AND lekt_lexeme_weight.target_lang_id = l2_doc_norms.target_lang_id
    AND lekt_lexeme_weight.phrasepair_id = l2_doc_norms.phrasepair_id;

CREATE INDEX lekt_idf_multi_ix ON lekt_lexeme_weight (base_lang_id, target_lang_id, lexeme_id);

--
--  function to search for top scoring matches
--

CREATE OR REPLACE FUNCTION lekt_lexeme_search (base_lang_id integer, target_lang_id integer, lexemes integer[])
    RETURNS TABLE (
        phrasepair_id integer,
        score double precision)
    IMMUTABLE
    AS $$
    SELECT
        phrasepair_id,
        sum(weight) AS score
    FROM
        lekt_lexeme_weight s
    WHERE
        $1 = s.base_lang_id
        AND $2 = s.target_lang_id
        AND lexeme_id = ANY ($3)
    GROUP BY
        phrasepair_id
    ORDER BY
        score DESC;

$$
LANGUAGE sql;

--
-- cleanup
--

DROP TABLE lekt_lexeme_tf;

DROP TABLE lekt_lexeme_idf;

