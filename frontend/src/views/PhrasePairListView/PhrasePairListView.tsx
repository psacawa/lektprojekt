import { Grid, Typography } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import LanguageSelect from "components/LanguageSelect";
import PhrasePairListTable from "components/PhrasePairListTable";
import PhrasePairSearchOptions from "components/PhrasePairSearchOptions";
import { useLanguages, usePairObservableSearch } from "hooks";
import React, { useState } from "react";
import { Coloured, Feature, Language, Lexeme } from "types";

const PhrasePairListView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [lexemes, setLexemes] = useState<Coloured<Lexeme>[]>([]);
  const [features, setFeatures] = useState<Coloured<Feature>[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [lexemeOptions, setLexemeOptions] = useState<Lexeme[]>([]);
  const [featureOptions, setFeatureOptions] = useState<Feature[]>([]);

  const languageQuery = useLanguages({
    refetchOnWindowFocus: false,
  });
  if (!baseLanguage && !targetLanguage && languageQuery.data) {
    // on page load, english and spanish are the selected default languages
    setBaseLanguage(
      languageQuery.data.find((lang) => lang.lid === "en") ?? null
    );
    setTargetLanguage(
      languageQuery.data.find((lang) => lang.lid === "es") ?? null
    );
  }

  const phrasePairQuery = usePairObservableSearch(
    {
      baseLang: baseLanguage?.id,
      targetLang: targetLanguage?.id,
      lexemes: lexemes.map((lexeme) => lexeme.id),
      features: features.map((feature) => feature.id),
      page: pageNumber + 1,
      pageSize: rowsPerPage,
    },
    {
      enabled:
        !!baseLanguage &&
        !!targetLanguage &&
        lexemes.length + features.length > 0,
    }
  );
  const handleChangePage = (event: React.ChangeEvent<{}>, page: number) => {
    setPageNumber(page);
  };
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setRowsPerPage(parseInt(event.currentTarget.value));

  const resetSearchObservables = () => {
    setLexemeOptions([]);
    setLexemes([]);
    setFeatures([]);
    setFeatureOptions([]);
  };
  return (
    <>
      <Typography style={{ margin: 30 }} variant="h5">
        Welcome to{" "}
        <span style={{ color: "blue" }}>Semantically Enhanced Search</span> Mode
      </Typography>
      <Grid container justifyContent="center" spacing={4}>
        {languageQuery.isFetching ? (
          <Grid item>
            <CircularProgress />
          </Grid>
        ) : (
          <>
            <LanguageSelect
              baseLanguage={baseLanguage}
              handleBaseLanguageChange={(ev, newLang) => {
                setBaseLanguage(newLang);
              }}
              handleTargetLanguageChange={(ev, newLang) => {
                setTargetLanguage(newLang);
                resetSearchObservables();
              }}
              languageOptions={languageQuery!.data!}
              targetLanguage={targetLanguage}
              {...{
                setBaseLanguage,
                setTargetLanguage,
                resetSearchObservables,
              }}
            />
            <PhrasePairSearchOptions
              features={features}
              language={targetLanguage}
              lexemes={lexemes}
              setFeatures={setFeatures}
              setLexemes={setLexemes}
              setPageNumber={setPageNumber}
              {...{
                lexemeOptions,
                setLexemeOptions,
                featureOptions,
                setFeatureOptions,
              }}
            />
            <PhrasePairListTable
              {...{
                baseLanguage,
                targetLanguage,
                pageNumber,
                rowsPerPage,
                phrasePairQuery,
                lexemes,
                features,
                onRowsPerPageChange: handleRowsPerPageChange,
                onPageChange: handleChangePage,
              }}
            />
          </>
        )}
      </Grid>
    </>
  );
};

export default PhrasePairListView;
