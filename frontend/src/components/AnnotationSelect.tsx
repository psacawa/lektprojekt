import {
  Chip,
  CircularProgress,
  debounce,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import { isEqual, uniqWith } from "lodash";
import React, { useState } from "react";
import { useQuery } from "react-query";

import * as client from "../client";
import { Language, Annotation } from "../types";

interface Props {
  language: Language | null;
  disabled: boolean;
  value: Annotation[];
  setValue: React.Dispatch<Annotation[]>;
  onChange: (
    ev: React.ChangeEvent<{}>,
    value: Annotation[],
    reason: any
  ) => any;
  optionsLimit?: number;
}

const AnnotationSelect = ({
  language,
  disabled,
  value,
  setValue,
  onChange,
  optionsLimit = 50,
}: Props) => {
  const [options, setOptions] = useState<Annotation[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const annotationQuery = useQuery(
    ["annotations", { lang: language?.id, prompt: inputValue }],
    ({ queryKey }) => {
      const [_key, { lang, prompt }] = queryKey;
      return client.completeAnnotations(lang, prompt);
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
    <Grid item xs={6}>
      <Autocomplete
        multiple
        renderTags={() => null}
        // inputValue={inputValue}
        value={value}
        getOptionLabel={(option) => option.explanation}
        options={options}
        loading={annotationQuery.isFetching}
        disabled={disabled}
        onInputChange={handleInputChange}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {annotationQuery.isFetching ? (
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
              <Typography>{option.explanation}</Typography>
            </Grid>
          </Grid>
        )}
      />
      <List>
        {value.map((annotation, idx) => (
          <ListItem>
            <Grid item xs={6}>
              {annotation.explanation}
            </Grid>
            <Grid xs={6}>
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
            </Grid>
          </ListItem>
        ))}
      </List>
    </Grid>
  );
};

export default AnnotationSelect;
