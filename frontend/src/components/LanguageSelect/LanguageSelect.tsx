import { Grid, IconButton, TextField } from "@material-ui/core";
import { SwapHoriz } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { Language } from "types";
import { useSearchContext } from "views/PhrasePairListView/SearchContext";

interface Props {
  languageOptions: Language[];
}

const LanguageSelect = ({ languageOptions }: Props) => {
  const {
    baseLanguage,
    targetLanguage,
    setBaseLanguage,
    setTargetLanguage,
    resetSearch,
  } = useSearchContext();
  return (
    <Grid container justifyContent="space-around">
      <Grid item md={5} xs={12}>
        <Autocomplete
          getOptionLabel={(lang) => lang.name}
          onChange={(ev, newLang) => {
            setBaseLanguage(newLang);
          }}
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
          resetSearch();
        }}
      >
        <SwapHoriz />
      </IconButton>

      <Grid item md={5} xs={12}>
        <Autocomplete
          getOptionLabel={(lang) => lang.name}
          onChange={(ev, newLang) => {
            setTargetLanguage(newLang);
            resetSearch();
          }}
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
