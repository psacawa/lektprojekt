import { Grid, IconButton, TextField } from "@material-ui/core";
import { SwapHoriz } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { Language } from "types";

interface Props {
  baseLanguage: Language | null;
  targetLanguage: Language | null;
  languageOptions: Language[];
  handleBaseLanguageChange: (...args: any[]) => any;
  handleTargetLanguageChange: (...args: any[]) => any;
  setBaseLanguage: React.Dispatch<Language | null>;
  setTargetLanguage: React.Dispatch<Language | null>;
  resetSearchObservables: () => void;
}

const LanguageSelect = ({
  baseLanguage,
  targetLanguage,
  handleBaseLanguageChange,
  handleTargetLanguageChange,
  setBaseLanguage,
  setTargetLanguage,
  languageOptions,
  resetSearchObservables,
}: Props) => {
  return (
    <Grid container justifyContent="space-around">
      <Grid item md={5} xs={12}>
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
      <IconButton
        onClick={(ev: React.MouseEvent<{}>) => {
          setBaseLanguage(targetLanguage);
          setTargetLanguage(baseLanguage);
          resetSearchObservables();
        }}
      >
        <SwapHoriz />
      </IconButton>

      <Grid item md={5} xs={12}>
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
    </Grid>
  );
};

export default LanguageSelect;
