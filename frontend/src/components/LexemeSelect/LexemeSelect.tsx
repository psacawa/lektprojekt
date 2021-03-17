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

interface Props {
  language: Language | null;
  value: Coloured<Lexeme>[];
  setValue: React.Dispatch<Lexeme[]>;
  onChange: (
    ev: React.ChangeEvent<{}>,
    value: Coloured<Lexeme>[],
    reason: any
  ) => any;
}

const useStyles = makeStyles(() => ({
  listItem: {
    borderRadius: "10px",
  },
}));

const LexemeSelect = ({ language, value, setValue, onChange }: Props) => {
  const classes = useStyles();
  const [options, setOptions] = useState<Lexeme[]>([]);
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
    <Grid item xs={6}>
      <Autocomplete
        multiple
        renderTags={() => null}
        getOptionLabel={(option) => option.lemma}
        options={options}
        loading={lexemeQuery.isFetching}
        onInputChange={handleInputChange}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select words"
            variant="standard"
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
      />
      <List dense>
        {value.map((lexeme, idx) => (
          <ListItem
            key={idx}
            className={classes.listItem}
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
                  let newValue = value.filter(
                    (value, valueIdx) => idx !== valueIdx
                  );
                  setValue(newValue);
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
