import { Grid, Typography } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import FeatureSelect from "components/FeatureSelect";
import LanguageSelect from "components/LanguageSelect";
import LexemeSelect from "components/LexemeSelect";
import PhrasePairListTable from "components/PhrasePairListTable";
import { useLanguages, usePairObservableSearch } from "hooks";
import React, { useEffect } from "react";

import { SearchContextProvider, useSearchContext } from "./SearchContext";

const PhrasePairListViewWrapped = () => {
  const {
    baseLanguage,
    setBaseLanguage,
    targetLanguage,
    setTargetLanguage,
    lexemes,
    setLexemes,
    features,
    setFeatures,
    pageNumber,
    setPageNumber,
    rowsPerPage,
    setRowsPerPage,
    lexemeOptions,
    setLexemeOptions,
    featureOptions,
    setFeatureOptions,
  } = useSearchContext();
  const languageQuery = useLanguages({
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    if (!baseLanguage && !targetLanguage && languageQuery.data) {
      // on page load, english and spanish are the selected default languages
      setBaseLanguage(
        languageQuery.data.find((lang) => lang.lid === "en") ?? null
      );
      setTargetLanguage(
        languageQuery.data.find((lang) => lang.lid === "es") ?? null
      );
    }
  });

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
            <LexemeSelect />
            <FeatureSelect />
            <PhrasePairListTable
              {...{
                phrasePairQuery,
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

const PhrasePairListView = () => {
  return (
    <SearchContextProvider>
      <PhrasePairListViewWrapped />
    </SearchContextProvider>
  );
};

export default PhrasePairListView;
