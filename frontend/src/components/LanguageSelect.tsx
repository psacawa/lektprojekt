import { Grid, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React from "react";

import { Language } from "../types";

interface Props {
  baseLanguage: Language | null;
  targetLanguage: Language | null;
  languageOptions: Language[];
  handleBaseLanguageChange: (...args: any[]) => any;
  handleTargetLanguageChange: (...args: any[]) => any;
}

const LanguageSelect = ({
  baseLanguage,
  targetLanguage,
  handleBaseLanguageChange,
  handleTargetLanguageChange,
  languageOptions,
}: Props) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <Autocomplete
          value={baseLanguage}
          onChange={handleBaseLanguageChange}
          options={languageOptions}
          getOptionLabel={(lang) => lang.name}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Base Language"
            ></TextField>
          )}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Autocomplete
          value={targetLanguage}
          onChange={handleTargetLanguageChange}
          options={languageOptions}
          getOptionLabel={(lang) => lang.name}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Target language"
            ></TextField>
          )}
        />
      </Grid>
    </>
  );
};

export default LanguageSelect;
