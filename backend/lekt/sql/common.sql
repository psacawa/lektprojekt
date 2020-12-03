--  number of tokens belonging to the same lexeme 
SELECT lemma,
       count(DISTINCT norm) AS cnt
FROM lekt_word
GROUP BY lemma
ORDER BY cnt DESC;

--  naive query for a single language ranking both on words and annotations
--  Time: 229,833 ms
SELECT p.phrase_id, p.text,
       COUNT (*) AS score,
      array_agg (w.norm)
FROM lekt_phrase p
JOIN lekt_phrase_words pw USING (phrase_id)
JOIN lekt_word w USING (word_id)
JOIN lekt_word_annotations wa USING (word_id)
JOIN lekt_annotation a USING (annot_id)
JOIN lekt_language l ON (l.lang_id = p.lang_id)
WHERE l.lid = 'es'
  AND (a.value = 'Mood=Cnd'
       OR w.lemma = 'gato')
GROUP BY phrase_id
ORDER BY score DESC ;

--  same naive query, but also returns data from whole phrase pair 
--  Time: 380,487 ms
SELECT pp.phrasepair_id,
       bp.phrase_id AS base_id,
       bp.text AS base_text,
       tp.phrase_id AS target_id,
       tp.text AS target_text,
       COUNT (*) AS score
FROM lekt_phrasepair pp
JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
JOIN lekt_language bl ON (bl.lang_id = bp.lang_id)
JOIN lekt_phrase tp ON (pp.target_id = tp.phrase_id)
JOIN lekt_language tl ON (tl.lang_id = tp.lang_id)
JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
JOIN lekt_word tw USING (word_id)
JOIN lekt_word_annotations wa USING (word_id)
JOIN lekt_annotation a USING (annot_id)
WHERE bl.lid = 'en'
  AND tl.lid = 'es'
  AND (a.value = 'Mood=Cnd'
       OR tw.lemma = 'gato')
GROUP BY pp.phrasepair_id,
         bp.phrase_id,
         tp.phrase_id
ORDER BY score DESC ;

--  same naive query, but better join order; much faster
--  Time: 29,667 ms
SELECT pp.phrasepair_id,
       bp.phrase_id AS base_id,
       bp.text AS base_text,
       tp.phrase_id AS target_id,
       tp.text AS target_text,
       COUNT (*) AS score
FROM lekt_phrase tp
JOIN lekt_language tl ON (tl.lang_id = tp.lang_id)
JOIN lekt_phrase_words tpw ON (tp.phrase_id = tpw.phrase_id)
JOIN lekt_word tw USING (word_id)
JOIN lekt_word_annotations wa USING (word_id)
JOIN lekt_annotation a USING (annot_id)
JOIN lekt_phrasepair pp ON (pp.target_id = tp.phrase_id)
JOIN lekt_phrase bp ON (pp.base_id = bp.phrase_id)
JOIN lekt_language bl ON (bl.lang_id = bp.lang_id)
WHERE bl.lid = 'en'
  AND tl.lid = 'es'
  AND (a.value = 'Mood=Cnd'
       OR tw.lemma = 'gato')
GROUP BY pp.phrasepair_id,
         bp.phrase_id,
         tp.phrase_id
ORDER BY score DESC ;

