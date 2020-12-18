import { Grid, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Language } from "../types";

interface Props {
  baseLanguage: Language | undefined;
  targetLanguage: Language | undefined;
  languageOptions: Language[];
}

const LanguageSelect = ({
  baseLanguage,
  targetLanguage,
  languageOptions,
}: Props) => {
  return (
    <>
      <Grid item xs={12} md={6}>
        <Autocomplete
          value={baseLanguage}
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
