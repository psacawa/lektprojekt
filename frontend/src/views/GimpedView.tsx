import {
  FormControl,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { CircularProgress, InputLabel } from "@material-ui/core";
import * as client from "../client";
import { Language } from "../types";
import { Formik } from "formik";
import { Autocomplete } from "@material-ui/lab";

const useStyles = makeStyles(() => ({
  item: {
    margin: 1,
  },
}));

const GimpedView = () => {
  const classes = useStyles();
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
      <Typography variant="h5">Welcome to Gimped Mode</Typography>
      {languagesQuery.isFetching ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <InputLabel>Base language</InputLabel>
            <Autocomplete
              value={baseLanguage}
              options={languagesQuery!.data!}
              getOptionLabel={(lang) => lang.name}
              renderInput={(params) => (
                <TextField {...params}>{params.id}</TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <InputLabel>Target language</InputLabel>
            <Autocomplete
              value={targetLanguage}
              options={languagesQuery!.data!}
              getOptionLabel={(lang) => lang.name}
              renderInput={(params) => (
                <TextField {...params}>{params.id}</TextField>
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel>Search term</InputLabel>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default GimpedView;
