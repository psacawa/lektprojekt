import { useState } from "react";
import { Typography, TextField, CircularProgress } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Grid } from "@material-ui/core";
import { Language, Lexeme } from "../types";
import { useQuery } from "react-query";
import { debounce } from "lodash";
import * as client from "../client";

interface Props {
  targetLanguage: Language | undefined;
  disabled: boolean;
  options: Lexeme[];
  setOptions: React.Dispatch<React.SetStateAction<Lexeme[]>>;
  value?: Lexeme;
  setValue: React.Dispatch<React.SetStateAction<Lexeme | undefined>>;
  inputValue: string;
  onInputChange: any;
}

const AsyncWordSelect = ({
  targetLanguage,
  disabled,
  options,
  setOptions,
  value,
  setValue,
  inputValue,
  onInputChange,
}: Props) => {
  const [open, setOpen] = useState(false);

  const lexemeQuery = useQuery(
    ["lexemes", { lid: targetLanguage?.lid, prompt: inputValue }],
    ({ queryKey }) => {
      const [_key, { lid, prompt }] = queryKey;
      return client.completeLexemes(lid, prompt);
    },
    {
      enabled: inputValue.length >= 3,
      onSuccess: (results) => {
        const newOptions = [...options, ...results];
        setOptions(newOptions);
      },
    }
  );

  return (
    <Grid item xs={12}>
      <Autocomplete
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        value={value}
        onClose={() => {
          setOpen(false);
        }}
        getOptionLabel={(option) => option.lemma}
        options={options}
        loading={lexemeQuery.isFetching}
        disabled={disabled}
        onInputChange={onInputChange}
        onChange={(ev, newValue, reason) => {
          newValue && setValue(newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search term"
            variant="outlined"
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
          // `${option.lemma} ${option.pos}`
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
    </Grid>
  );
};

export default AsyncWordSelect;
