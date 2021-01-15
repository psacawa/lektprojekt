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
import React, { useState } from "react";

import { useAnnotations } from "../clientHooks";
import { Annotation, Coloured, Language } from "../types";

interface Props {
  language: Language | null;
  disabled: boolean;
  value: Coloured<Annotation>[];
  setValue: React.Dispatch<Annotation[]>;
  onChange: (
    ev: React.ChangeEvent<{}>,
    value: Coloured<Annotation>[],
    reason: any
  ) => any;
}

const useStyles = makeStyles((theme) => ({
  listItem: {
    borderRadius: "10px",
  },
}));

const AnnotationSelect = ({
  language,
  disabled,
  value,
  setValue,
  onChange,
}: Props) => {
  const [options, setOptions] = useState<Annotation[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const classes = useStyles();

  const annotationQuery = useAnnotations(
    { lang: language?.id },
    {
      staleTime: 60 * 1000,
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
        value={value}
        getOptionLabel={(option) => option.description}
        options={annotationQuery.data ?? []}
        loading={annotationQuery.isFetching}
        disabled={disabled}
        onInputChange={handleInputChange}
        onChange={onChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select grammatical features"
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
              <Typography>{option.description}</Typography>
            </Grid>
          </Grid>
        )}
      />
      <List dense>
        {value.map((annotation, idx) => (
          <ListItem
            key={idx}
            className={classes.listItem}
            style={{ backgroundColor: annotation.colour! }}
          >
            <ListItemText>
              <Typography>{annotation.description}</Typography>
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

export default AnnotationSelect;
