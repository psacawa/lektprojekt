import { useEffect, useState } from "react";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Language, Lexeme } from "../types";
import { useQuery } from "react-query";
import * as client from "../client";

interface Props {
  targetLanguage: Language | undefined;
  disabled: boolean;
}

const AsyncWordSelect = ({ targetLanguage, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const value: string = "";
  const [options, setOptions] = useState<Lexeme[]>([]);

  const lexemeQuery = useQuery(
    ["lexemes", { lid: targetLanguage?.lid, prompt: value }],
    ({ queryKey }) => {
      if (value.length > 2 && targetLanguage) {
        return client.completeLexemes(queryKey.lid, queryKey.prompt);
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

  return (
    <Autocomplete
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionLabel={(option) => option.lemma}
      options={options}
      loading={lexemeQuery.isFetching}
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
