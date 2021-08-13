import { Grid, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Language } from "types";

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
      <Grid item md={6} xs={12}>
        <Autocomplete
          getOptionLabel={(lang) => lang.name}
          onChange={handleBaseLanguageChange}
          options={languageOptions}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Base Language"
              variant="outlined"
            ></TextField>
          )}
          value={baseLanguage}
        />
      </Grid>
      <Grid item md={6} xs={12}>
        <Autocomplete
          getOptionLabel={(lang) => lang.name}
          onChange={handleTargetLanguageChange}
          options={languageOptions}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Target language"
              variant="outlined"
            ></TextField>
          )}
          value={targetLanguage}
        />
      </Grid>
    </>
  );
};

export default LanguageSelect;
