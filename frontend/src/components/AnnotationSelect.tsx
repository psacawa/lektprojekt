import {
  CircularProgress,
  debounce,
  TextField,
  Typography,
} from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import { isEqual, uniqWith } from "lodash";
import { useState } from "react";
import { useQuery } from "react-query";

import * as client from "../client";
import { Language, Lexeme } from "../types";

interface Props {
  language: Language | null;
  disabled: boolean;
  value: Lexeme | null;
  onChange: any;
  optionsLimit?: number;
  key: number;
  number?: number;
  label?: string;
}

const LexemeSelect = ({
  language,
  disabled,
  value,
  onChange,
  key,
  number,
  label,
  optionsLimit = 50,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Lexeme[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const lexemeQuery = useQuery(
    ["lexemes", { lang: language?.id, prompt: inputValue }],
    ({ queryKey }) => {
      const [_key, { lang, prompt }] = queryKey;
      return client.completeLexemes(lang, prompt);
    },
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
        onInputChange={handleInputChange}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label ?? `Lexeme ${number!+1}`}
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

export default LexemeSelect;
