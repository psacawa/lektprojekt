import { CircularProgress, TextField, Typography } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import { isEqual, uniqWith } from "lodash";
import { useState } from "react";
import { useQuery } from "react-query";

import * as client from "../client";
import { Language, Lexeme } from "../types";

interface Props {
  targetLanguage: Language | null;
  disabled: boolean;
  options: Lexeme[];
  setOptions: React.Dispatch<React.SetStateAction<Lexeme[]>>;
  value: Lexeme | null;
  onChange: any;
  inputValue: string;
  onInputChange: any;
  optionsLimit?: number;
}

const AsyncWordSelect = ({
  targetLanguage,
  disabled,
  options,
  setOptions,
  value,
  onChange,
  inputValue,
  onInputChange,
  optionsLimit = 50,
}: Props) => {
  const [open, setOpen] = useState(false);

  const lexemeQuery = useQuery(
    ["lexemes", { id: targetLanguage?.id, prompt: inputValue }],
    ({ queryKey }) => {
      const [_key, { id, prompt }] = queryKey;
      return client.completeLexemes(id, prompt);
    },
    {
      enabled: inputValue.length >= 3,
      staleTime: 60 * 1000,
      onSuccess: (results) => {
        const newOptions = uniqWith(
          [...results, ...options],
          // (lexeme1: Lexeme, lexeme2: Lexeme) => lexeme1.id === lexeme2.id
          isEqual
        );
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
        // inputValue={inputValue}
        value={value}
        onClose={() => {
          setOpen(false);
        }}
        getOptionLabel={(option) => option.lemma}
        options={options}
        loading={lexemeQuery.isFetching}
        disabled={disabled}
        onInputChange={onInputChange}
        onChange={onChange}
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
