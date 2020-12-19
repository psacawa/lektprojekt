import { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Grid } from "@material-ui/core";
import { Language, Lexeme } from "../types";
import { useQuery } from "react-query";
import { debounce } from "lodash";
import * as client from "../client";

interface Props {
  targetLanguage: Language | undefined;
  disabled: boolean;
  options: Lexeme[];
  setOptions: React.Dispatch<React.SetStateAction<any[]>>;
}

const AsyncWordSelect = ({
  targetLanguage,
  disabled,
  options,
  setOptions,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const lexemeQuery = useQuery(
    ["lexemes", { lid: targetLanguage?.lid, prompt: inputValue }],
    ({ queryKey }) => {
      const [_key, { lid, prompt }] = queryKey;
      return client.completeLexemes(lid, prompt);
    },
    {
      enabled: inputValue.length >= 3,
      onSuccess: (data) => {
        const newOptions = [...options, ...data.results];
        setOptions(newOptions);
      },
    }
  );
  const handleInputChange = debounce(
    (event, newInputValue) => setInputValue(newInputValue),
    300
  );

  return (
    <Grid item xs={12}>
      <Autocomplete
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        getOptionLabel={(option) => `${option.lemma} ${option.pos}`}
        options={options}
        loading={lexemeQuery.isFetching}
        disabled={disabled}
        onInputChange={handleInputChange}
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
      />
    </Grid>
  );
};

export default AsyncWordSelect;
