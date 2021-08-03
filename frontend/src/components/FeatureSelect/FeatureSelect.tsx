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
import { useFeatures } from "hooks";
import React, { useState } from "react";
import { Coloured, Feature, Language } from "types";

interface Props {
  language: Language | null;
  value: Coloured<Feature>[];
  setValue: React.Dispatch<Feature[]>;
  onChange: (
    ev: React.ChangeEvent<{}>,
    value: Coloured<Feature>[],
    reason: any
  ) => any;
}

const useStyles = makeStyles((theme) => ({
  listItem: {
    borderRadius: "10px",
  },
}));

const FeatureSelect = ({ language, value, setValue, onChange }: Props) => {
  const [inputValue, setInputValue] = useState<string>("");
  const classes = useStyles();

  const featureQuery = useFeatures(
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
    <Grid item xs={12} md={6}>
      <Autocomplete
        multiple
        renderTags={() => null}
        value={value}
        getOptionLabel={(option) => option.description}
        options={featureQuery.data ?? []}
        loading={featureQuery.isFetching}
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
                  {featureQuery.isFetching ? (
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
        {value.map((feature, idx) => (
          <ListItem
            key={idx}
            className={classes.listItem}
            style={{ backgroundColor: feature.colour! }}
          >
            <ListItemText>
              <Typography>{feature.description}</Typography>
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

export default FeatureSelect;
