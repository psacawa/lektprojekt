import { Grid, Typography } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import React, { useState } from "react";
import { useQuery } from "react-query";

import * as client from "../client";
import LanguageSelect from "../components/LanguageSelect";
import PhrasePairListTable from "../components/PhrasePairListTable";
import PhrasePairSearchOptions from "../components/PhrasePairSearchOptions";
import { Annotation, Coloured, Language, Lexeme, PhrasePair } from "../types";

const PhrasePairListView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [lexemes, setLexemes] = useState<Coloured<Lexeme>[]>([]);
  const [annotations, setAnnotations] = useState<Coloured<Annotation>[]>([]);

  const languageQuery = useQuery("languages", client.listLanguages, {
    onSuccess: (languages) => {
      let newBaseLanguage = languages.find((lang) => lang.lid === "en") ?? null;
      let newTargetLanguage =
        languages.find((lang) => lang.lid === "es") ?? null;
      setBaseLanguage(newBaseLanguage);
      setTargetLanguage(newTargetLanguage);
    },
    refetchOnWindowFocus: false,
  });

  const phrasePairQuery = useQuery(
    [
      "pairs",
      [
        baseLanguage?.id,
        targetLanguage?.id,
        lexemes.map((lexeme) => lexeme.id),
        annotations.map((annotation) => annotation.id),
      ],
    ],
    () =>
      client.searchPairsByFeatures(
        baseLanguage!.id,
        targetLanguage!.id,
        lexemes.map((lexeme) => lexeme.id),
        annotations.map((annotation) => annotation.id)
      ),
    {
      enabled: lexemes.length + annotations.length > 0,
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
