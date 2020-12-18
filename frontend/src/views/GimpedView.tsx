import { Grid, TextField, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { CircularProgress } from "@material-ui/core";
import * as client from "../client";
import { Language } from "../types";
import { Autocomplete } from "@material-ui/lab";
import AsyncWordSelect from "../components/AsyncWordSelect";
import LanguageSelect from "../components/LanguageSelect";

const GimpedView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | undefined>(
    undefined
  );
  const [targetLanguage, setTargetLanguage] = useState<Language | undefined>(
    undefined
  );
  const languagesQuery = useQuery("languages", client.listLanguages, {
    onSuccess: (data) => {
      setBaseLanguage(data.find((lang) => lang.lid === "en"));
      setTargetLanguage(data.find((lang) => lang.lid === "es"));
    },
  });
  return (
    <>
      <Typography variant="h5" style={{ margin: 30 }}>
        Welcome to Gimped Mode
      </Typography>
      {languagesQuery.isFetching ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={4}>
            <LanguageSelect
              baseLanguage={baseLanguage}
              targetLanguage={targetLanguage}
              languageOptions={languagesQuery!.data!}
            />
            <AsyncWordSelect
              targetLanguage={targetLanguage}
              disabled={!targetLanguage}
            />
          </Grid>
        </>
      )}
    </>
  );
};

export default GimpedView;
