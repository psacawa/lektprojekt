import {
  Grid,
  makeStyles,
  TablePagination,
  Typography,
} from "@material-ui/core";
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
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => setRowsPerPage(parseInt(event.currentTarget.value));
  return (
    <>
      <Typography variant="h5" style={{ margin: 30 }}>
        Welcome to{" "}
        <span style={{ color: "blue" }}>Semantically Enhanced Search</span> Mode
      </Typography>
      <Grid container justify="center" spacing={4}>
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
              targetLanguage={targetLanguage}
              handleTargetLanguageChange={(ev, newLang) => {
                setTargetLanguage(newLang);
              }}
              languageOptions={languageQuery!.data!}
            />
            <PhrasePairSearchOptions
              lexemes={lexemes}
              setLexemes={setLexemes}
              features={features}
              setFeatures={setFeatures}
              language={targetLanguage}
              setPageNumber={setPageNumber}
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
                onChangeRowsPerPage: handleChangeRowsPerPage,
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
