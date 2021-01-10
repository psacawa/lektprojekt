--  This SQL script populates the tables lekt_lexeme_weight, lekt_annotation_weight, and
--  lekt_feature_weight which contain tf-idf weights for lexemes, annotations, and all
--  linguistic features respectively. It does so separately for each language pair, and
--  also creates an index that allows these tables to be searched quickly.
--  It's run from  compute_search_scores, which itself is run after a 
--  load_corpus operation.
--  TODO 10/01/20 psacawa: it will be necessary to refactor this to take the language pair
--  as an argument when working with large datasets
--
--  LEXEME WEIGHTS
--

CREATE OR REPLACE PROCEDURE compute_lexeme_weights ()
    AS $$
BEGIN
    DROP TABLE IF EXISTS lekt_lexeme_tf;
    DROP TABLE IF EXISTS lekt_lexeme_idf;
    --  term frequencies
    CREATE UNLOGGED TABLE lekt_lexeme_tf AS (
        SELECT
            bp.lang_id AS base_lang_id,
            tp.lang_id AS target_lang_id,
            tl.lexeme_id,
            pp.phrasepair_id,
            count(*) AS tf
        FROM
            lekt_phrasepair pp
            JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id )
            JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id )
            JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id )
            JOIN lekt_word tw ON (tpw.word_id = tw.word_id )
            JOIN lekt_lexeme tl ON (tw.lexeme_id = tl.lexeme_id )
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
    --  inverse document frequencies
    CREATE UNLOGGED TABLE lekt_lexeme_idf AS (
        WITH lekt_doc_counts AS (
        SELECT
            bp.lang_id AS base_lang_id,
            tp.lang_id AS target_lang_id,
            count(* ) AS n
        FROM
            lekt_phrasepair pp
            JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id )
            JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id )
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
            ln(dc.n::float / count(DISTINCT tp.phrase_id )
                ) AS idf
            FROM
                lekt_phrasepair pp
                JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id )
                JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id )
                JOIN lekt_doc_counts dc ON (bp.lang_id = dc.base_lang_id AND tp.lang_id = dc.target_lang_id )
                JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id )
                JOIN lekt_word tw ON (tpw.word_id = tw.word_id )
                JOIN lekt_lexeme tl ON (tw.lexeme_id = tl.lexeme_id )
            WHERE
                pp.active
            GROUP BY
                bp.lang_id,
                tp.lang_id,
                tl.lexeme_id,
                dc.n
            );
    --  l2 normalized tf-idf scores
    TRUNCATE lekt_lexeme_weight;
    DROP INDEX IF EXISTS lekt_lexeme_weight_multi_ix;
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
        CREATE INDEX lekt_lexeme_weight_multi_ix ON lekt_lexeme_weight (base_lang_id, target_lang_id, lexeme_id);
        -- cleanup
        DROP TABLE lekt_lexeme_tf;
        DROP TABLE lekt_lexeme_idf;
END;
$$
LANGUAGE plpgsql;

--
--  ANNOTATION WEIGHTS
--

CREATE OR REPLACE PROCEDURE compute_annotation_weights ()
    AS $$
BEGIN
    DROP TABLE IF EXISTS lekt_annotation_tf;
    DROP TABLE IF EXISTS lekt_annotation_idf;
    --  term frequencies
    CREATE UNLOGGED TABLE lekt_annotation_tf AS (
        SELECT
            bp.lang_id AS base_lang_id,
            tp.lang_id AS target_lang_id,
            ta.annot_id,
            pp.phrasepair_id,
            count(*) AS tf
        FROM
            lekt_phrasepair pp
            JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id )
            JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id )
            JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id )
            JOIN lekt_word_annotations twa ON (tpw.word_id = twa.word_id )
            JOIN lekt_annotation ta ON (twa.annot_id = ta.annot_id )
        WHERE
            pp.active
        GROUP BY
            base_lang_id,
            target_lang_id,
            ta.annot_id,
            pp.phrasepair_id
        );
    ALTER TABLE lekt_annotation_tf
        ADD PRIMARY KEY (base_lang_id, target_lang_id, annot_id, phrasepair_id);
    --  inverse document frequencies
    CREATE UNLOGGED TABLE lekt_annotation_idf AS (
        WITH lekt_doc_counts AS (
        SELECT
            bp.lang_id AS base_lang_id,
            tp.lang_id AS target_lang_id,
            count(* ) AS n
        FROM
            lekt_phrasepair pp
            JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id )
            JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id )
        WHERE
            pp.active
        GROUP BY
            base_lang_id,
            target_lang_id
            )
        SELECT
            bp.lang_id AS base_lang_id,
            tp.lang_id AS target_lang_id,
            ta.annot_id,
            ln(dc.n::float / count(DISTINCT tp.phrase_id )
                ) AS idf
        FROM
            lekt_phrasepair pp
            JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id )
            JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id )
            JOIN lekt_doc_counts dc ON (bp.lang_id = dc.base_lang_id AND tp.lang_id = dc.target_lang_id )
            JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id )
            JOIN lekt_word_annotations twa ON (tpw.word_id = twa.word_id )
            JOIN lekt_annotation ta ON (twa.annot_id = ta.annot_id )
        WHERE
            pp.active
        GROUP BY
            bp.lang_id,
            tp.lang_id,
            ta.annot_id,
            dc.n
        );
    --  l2 normalized tf-idf scores
    TRUNCATE lekt_annotation_weight;
    DROP INDEX IF EXISTS lekt_annotation_weight_multi_ix;
    INSERT INTO lekt_annotation_weight (base_lang_id, target_lang_id, annot_id, phrasepair_id, weight)
    SELECT
        lekt_annotation_tf.base_lang_id,
        lekt_annotation_tf.target_lang_id,
        lekt_annotation_tf.annot_id,
        lekt_annotation_tf.phrasepair_id,
        tf * idf AS weight
    FROM
        lekt_annotation_tf
        JOIN lekt_annotation_idf ON (lekt_annotation_tf.base_lang_id = lekt_annotation_idf.base_lang_id
                AND lekt_annotation_tf.target_lang_id = lekt_annotation_idf.target_lang_id
                AND lekt_annotation_tf.annot_id = lekt_annotation_idf.annot_id);
        WITH l2_doc_norms AS (
            SELECT
                base_lang_id,
                target_lang_id,
                phrasepair_id,
                sqrt(sum(weight ^ 2)) AS norm
            FROM
                lekt_annotation_weight
            GROUP BY
                base_lang_id,
                target_lang_id,
                phrasepair_id)
        UPDATE
            lekt_annotation_weight
        SET
            weight = weight / norm
        FROM
            l2_doc_norms
        WHERE
            lekt_annotation_weight.base_lang_id = l2_doc_norms.base_lang_id
            AND lekt_annotation_weight.target_lang_id = l2_doc_norms.target_lang_id
            AND lekt_annotation_weight.phrasepair_id = l2_doc_norms.phrasepair_id;
        COMMIT;
        CREATE INDEX lekt_annotation_weight_multi_ix ON lekt_annotation_weight (base_lang_id, target_lang_id, annot_id);
        -- cleanup
        DROP TABLE lekt_annotation_tf;
        DROP TABLE lekt_annotation_idf;
END;
$$
LANGUAGE plpgsql;
