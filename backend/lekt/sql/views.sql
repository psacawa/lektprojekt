--  basic views to join data with lekt_language relation
CREATE OR REPLACE VIEW word_view AS
SELECT w.word_id,
       w.norm,
       w.lemma,
       w.pos,
       w.tag,
       l.lid
FROM lekt_word w
JOIN lekt_language l USING (lang_id)
ORDER BY (l.lid,
          w.word_id);
CREATE OR REPLACE VIEW phrase_view AS
SELECT p.phrase_id,
       p.text,
       l.lid
FROM lekt_phrase p
JOIN lekt_language l USING (lang_id)
ORDER BY (l.lid,
          p.phrase_id);
CREATE OR REPLACE VIEW annotation_view AS
SELECT a.annot_id,
       a.value,
       a.explanation,
       l.lid
FROM lekt_annotation a
JOIN lekt_language l USING (lang_id)
ORDER BY (l.lid,
          a.value);
CREATE OR REPLACE VIEW voice_view AS
SELECT v.voice_id,
       v.name,
       v.accent,
       v.aid,
       v.gender,
       l.lang_id,
       l.lid
FROM lekt_voice v
JOIN lekt_language l USING (lang_id)
ORDER BY (l.lid,
          v.name);

--  composite views to cross M2M bridges
CREATE OR REPLACE VIEW phrase_word_view AS
SELECT p.phrase_id,
       p.text,
       w.word_id,
       w.norm,
       w.lemma,
       w.pos,
       w.tag,
       l.lid
FROM lekt_phrase p
JOIN lekt_phrase_words pw USING (phrase_id)
JOIN lekt_word w USING (word_id)
JOIN lekt_language l on (p.lang_id = l.lang_id);

CREATE OR REPLACE VIEW word_annotation_view AS
SELECT w.word_id,
       w.norm,
       w.lemma,
       w.pos,
       w.tag,
       a.annot_id,
       a.value,
       a.explanation,
       l.lid
FROM lekt_word w
JOIN lekt_word_annotations wa USING (word_id)
JOIN lekt_annotation a USING (annot_id)
JOIN lekt_language l on (w.lang_id = l.lang_id);

CREATE OR REPLACE VIEW phrasepair_view AS
SELECT pp.phrasepair_id,
       p1.phrase_id AS base_id,
       p1.text AS base_text,
       l1.lid AS base_lid,
       p2.phrase_id AS target_id,
       p2.text AS target_text,
       l2.lid AS target_lid
FROM lekt_phrasepair pp
JOIN lekt_phrase p1 ON (base_id = p1.phrase_id)
JOIN lekt_language l1 ON (p1.lang_id = l1.lang_id)
JOIN lekt_phrase p2 ON (target_id = p2.phrase_id)
JOIN lekt_language l2 ON (p2.lang_id = l2.lang_id);

--  crosses two M2M bridges: phrase <-> word <-> anntoation
CREATE OR REPLACE VIEW phrase_annotation_view AS
SELECT p.phrase_id,
       p.text,
       w.word_id,
       w.norm,
       w.lemma,
       w.pos,
       w.tag,
       a.annot_id,
       a.value,
       a.explanation,
       l.lid
FROM lekt_phrase p
JOIN lekt_phrase_words pw USING (phrase_id)
JOIN lekt_word w USING (word_id)
JOIN lekt_word_annotations wa USING (word_id)
JOIN lekt_annotation a USING (annot_id)
JOIN lekt_language l ON (a.lang_id = l.lang_id);

--  list of users along with their subscriptions and presently tracked items

CREATE OR REPLACE VIEW user_tracking_view AS
SELECT u.username,
       s.sub_id,
       bl.lid AS base_lid,
       tl.lid AS target_lid,
       a.annot_id,
       a.value
FROM auth_user u
JOIN lekt_userprofile up ON (u.id = up.user_id)
JOIN lekt_subscription s ON (s.owner_id = up.userprofile_id)
JOIN lekt_language bl ON (s.base_lang_id = bl.lang_id)
JOIN lekt_language tl ON (s.target_lang_id = tl.lang_id)
JOIN lekt_trackeditem tb ON (tb.sub_id = s.sub_id)
JOIN lekt_trackedannotation ta ON (tb.titem_id = ta.trackeditem_ptr_id)
JOIN lekt_annotation a ON (ta.annot_id = a.annot_id)
ORDER BY s.sub_id;

--  views for sysadmin
CREATE OR REPLACE VIEW options_view AS
SELECT category,
       name,
       setting,
       short_desc
FROM pg_settings
ORDER BY category,
         name;

