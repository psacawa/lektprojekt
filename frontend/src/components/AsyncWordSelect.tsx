import { useState } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Language, Lexeme } from "../types";
import { useQuery } from "react-query";
import { debounce } from "lodash";
import * as client from "../client";

interface Props {
  targetLanguage: Language | undefined;
  disabled: boolean;
}

const AsyncWordSelect = ({ targetLanguage, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Lexeme[]>([]);

  const lexemeQuery = useQuery(
    ["lexemes", { lid: targetLanguage?.lid, prompt: inputValue }],
    ({ queryKey }) => {
      const [_key, { lid, prompt }] = queryKey;
      if (inputValue.length > 2 && targetLanguage) {
        return client.completeLexemes(lid, prompt);
      } else {
        return Promise.reject();
      }
    },
    {
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
  );
};

export default AsyncWordSelect;
