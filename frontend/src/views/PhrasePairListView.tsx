import { Grid, Typography } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import React, { useState } from "react";

import { useLanguages, usePairFeatureSearch } from "../clientHooks";
import LanguageSelect from "../components/LanguageSelect";
import PhrasePairListTable from "../components/PhrasePairListTable";
import PhrasePairSearchOptions from "../components/PhrasePairSearchOptions";
import { Annotation, Coloured, Language, Lexeme } from "../types";

const PhrasePairListView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [lexemes, setLexemes] = useState<Coloured<Lexeme>[]>([]);
  const [annotations, setAnnotations] = useState<Coloured<Annotation>[]>([]);

  const languageQuery = useLanguages({
    refetchOnWindowFocus: false,
  });
  if (!baseLanguage && !targetLanguage && languageQuery.data) {
    // on page load, english and spanish are the selected languages
    setBaseLanguage(
      languageQuery.data.find((lang) => lang.lid === "en") ?? null
    );
    setTargetLanguage(
      languageQuery.data.find((lang) => lang.lid === "es") ?? null
    );
  }

  const phrasePairQuery = usePairFeatureSearch(
    {
      baseLang: baseLanguage?.id,
      targetLang: targetLanguage?.id,
      lexemes: lexemes.map((lexeme) => lexeme.id),
      annotations: annotations.map((annotation) => annotation.id),
    },
    {
      enabled:
        !!baseLanguage &&
        !!targetLanguage &&
        lexemes.length + annotations.length > 0,
    }
  );
  return (
    <>
      <Typography variant="h5" style={{ margin: 30 }}>
        Welcome to <span style={{ color: "blue" }}>Less Gimped Search</span>{" "}
        Mode
      </Typography>
      {languageQuery.isFetching ? (
        <CircularProgress />
      ) : (
        <>
          <Grid justify="center" container spacing={4}>
            <LanguageSelect
              baseLanguage={baseLanguage}
              handleBaseLanguageChange={(ev, newLang) => {
                setBaseLanguage(newLang);
              }}
              targetLanguage={targetLanguage}
              handleTargetLanguageChange={(ev, newLang) => {
                setTargetLanguage(newLang);
              }}
              languageOptions={languageQuery!.data!}
            />
            <PhrasePairSearchOptions
              lexemes={lexemes}
              setLexemes={setLexemes}
              annotations={annotations}
              setAnnotations={setAnnotations}
              language={targetLanguage}
            />
            <Grid item></Grid>
            <PhrasePairListTable
              {...{
                baseLanguage,
                targetLanguage,
                phrasePairQuery,
                lexemes,
                annotations,
              }}
            />
          </Grid>
        </>
      )}
    </>
  );
};

export default PhrasePairListView;
