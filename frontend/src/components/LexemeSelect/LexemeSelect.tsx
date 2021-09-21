import {
  CircularProgress,
  debounce,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { useLexemes } from "hooks";
import { isEqual, uniqWith } from "lodash";
import React, { useState } from "react";
import { Coloured, Language, Lexeme } from "types";
import { getLogger } from "utils";
import { useSearchContext } from "views/PhrasePairListView/SearchContext";

const logger = getLogger("LexemeSelect");

const useStyles = makeStyles(() => ({
  listItem: {
    borderRadius: "10px",
  },
}));

const LexemeSelect = () => {
  const {
    targetLanguage: language,
    lexemes,
    setLexemes,
    lexemeOptions: options,
    setLexemeOptions: setOptions,
    getRandomUnusedColour,
    resetPagination,
  } = useSearchContext();
  const classes = useStyles();
  const [inputValue, setInputValue] = useState<string>("");

  const lexemeQuery = useLexemes(
    { lang: language?.id, prompt: inputValue },
    {
      enabled: inputValue.length >= 3,
      staleTime: 60 * 1000,
      onSuccess: (results) => {
        const newOptions = uniqWith([...results, ...options], isEqual);
        setOptions(newOptions);
      },
    }
  );
  const handleInputChange: any = debounce(
    (event: React.ChangeEvent, newInputValue: string) =>
      setInputValue(newInputValue),
    300
  );

  return (
    <Grid item md={6} xs={12}>
      <Autocomplete
        getOptionLabel={(option) => option.lemma}
        loading={lexemeQuery.isFetching}
        multiple
        value={lexemes}
        onChange={(event, newLexemes: Coloured<Lexeme>[], reason) => {
          for (let lex of newLexemes) {
            if (lex.colour === undefined) {
              lex.colour = getRandomUnusedColour();
            }
          }
          setLexemes([...newLexemes]);
          resetPagination();
        }}
        onInputChange={handleInputChange}
        options={options}
        renderInput={(params) => (
          <TextField
            {...params}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {lexemeQuery.isFetching ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            label="Select words"
            variant="standard"
          />
        )}
        renderOption={(option) => (
          <Grid container>
            <Grid item xs={6}>
              <Typography>{option.lemma}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{option.pos}</Typography>
            </Grid>
          </Grid>
        )}
        renderTags={() => null}
      />
      <List dense>
        {lexemes.map((lexeme, idx) => (
          <ListItem
            className={classes.listItem}
            key={idx}
            style={{ backgroundColor: lexeme.colour! }}
          >
            <ListItemText>
              <Typography>{lexeme.lemma}</Typography>
            </ListItemText>
            <ListItemText>
              <Typography>{lexeme.pos}</Typography>
            </ListItemText>
            <ListItemSecondaryAction>
              <IconButton
                onClick={(event: React.MouseEvent<{}>) => {
                  let newLexemes = lexemes.filter(
                    (lexeme, lexemeIdx) => idx !== lexemeIdx
                  );
                  setLexemes(newLexemes);
                  resetPagination();
                }}
              >
                <Clear />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Grid>
  );
};

export default LexemeSelect;
