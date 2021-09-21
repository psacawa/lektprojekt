import { Grid, Typography } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import FeatureSelect from "components/FeatureSelect";
import LanguageSelect from "components/LanguageSelect";
import LexemeSelect from "components/LexemeSelect";
import { useLanguages, usePairCounts, usePairObservableSearch } from "hooks";
import React, { useEffect } from "react";
import { Language } from "types";
import { getLogger } from "utils";

import PhrasePairListTable from "./PhrasePairListTable";
import { SearchContextProvider, useSearchContext } from "./SearchContext";

const logger = getLogger("PhrasePairListView");

interface PhrasePairCountsNotificationProps {
  baseLanguage: Language<false> | null;
  targetLanguage: Language<false> | null;
}

/**
 * Renders alerts: "1234 exmamples available"
 * "Nothing for this language pair right now :("
 */
const PhrasePairCountsNotification = (
  props: PhrasePairCountsNotificationProps
) => {
  const pairCountQuery = usePairCounts();
  let count: number | undefined = undefined;
  if (
    pairCountQuery.isSuccess &&
    !!props.baseLanguage &&
    !!props.targetLanguage
  ) {
    count = pairCountQuery.data?.find(
      (pairCount) =>
        pairCount.base_lang === props.baseLanguage!.name &&
        pairCount.target_lang === props.targetLanguage!.name
    )?.count;
  }
  return (
    <Grid item xs={12}>
      <Grid container justifyContent="center">
        <Grid item>
          {pairCountQuery.data && (
            <Typography variant="h5">
              {typeof count === "number" ? (
                <>{count} examples available</>
              ) : (
                "Nothing for this language pair right now :("
              )}
            </Typography>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

const PhrasePairListViewWrapped = () => {
  const {
    baseLanguage,
    setBaseLanguage,
    targetLanguage,
    setTargetLanguage,
    lexemes,
    features,
    pageNumber,
    rowsPerPage,
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

  return (
    <>
      <Grid container justifyContent="center" spacing={4}>
        <>
          <Grid item>
            <Typography variant="h4">Semantically Enhanced Search</Typography>
          </Grid>
          {languageQuery.isFetching ? (
            <Grid item>
              <CircularProgress />
            </Grid>
          ) : (
            <>
              <LanguageSelect languageOptions={languageQuery!.data!} />
              <PhrasePairCountsNotification
                {...{ baseLanguage, targetLanguage }}
              />
              <LexemeSelect />
              <FeatureSelect />
              <PhrasePairListTable
                {...{
                  phrasePairQuery,
                }}
              />
            </>
          )}
        </>
      </Grid>
    </>
  );
};

/**
 * Temporary  until all functionality is moved out out PhrasePairListViewWrapped
 */
const PhrasePairListView = () => {
  return (
    <SearchContextProvider>
      <PhrasePairListViewWrapped />
    </SearchContextProvider>
  );
};

export default PhrasePairListView;
