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
import React, { useEffect, useState } from "react";
import { Coloured, Feature } from "types";
import { getLogger } from "utils";
import { useSearchContext } from "views/PhrasePairListView/SearchContext";

const logger = getLogger("FeatureSelect");

const useStyles = makeStyles(() => ({
  listItem: {
    borderRadius: "10px",
  },
}));

const FeatureSelect = () => {
  const {
    targetLanguage: language,
    features,
    setFeatures,
    setPageNumber,
    getRandomUnusedColour,
  } = useSearchContext();
  const classes = useStyles();

  // we control inputValue just to debounce
  const [_, setInputValue] = useState<string>("");
  const handleInputChange: any = debounce(
    (event: React.ChangeEvent, newInputValue: string) =>
      setInputValue(newInputValue),
    300
  );

  const featureQuery = useFeatures(
    { lang: language?.id! },
    {
      staleTime: 60 * 1000,
      enabled: !!language,
    }
  );
  return (
    <Grid item md={6} xs={12}>
      <Autocomplete
        getOptionLabel={(option) => option.description || ""}
        // getOptionLabel={(option) => "inf"}
        loading={featureQuery.isFetching}
        multiple
        onChange={(event, newFeatures: Coloured<Feature>[], reason) => {
          logger(
            "newFeatures",
            newFeatures.map((f) => f.colour)
          );
          for (let feat of newFeatures) {
            if (feat.colour === undefined) {
              let colour = getRandomUnusedColour();
              logger("colour", colour);
              feat.colour = colour;
            }
          }
          logger(
            "newFeatures",
            newFeatures.map((f) => f.colour)
          );
          setPageNumber(0);
          setFeatures(newFeatures);
        }}
        onInputChange={handleInputChange}
        options={featureQuery.data ?? []}
        renderInput={(params) => (
          <TextField
            {...params}
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
            label="Select grammatical features"
            variant="standard"
          />
        )}
        renderOption={(option) => (
          <Grid container>
            <Grid item xs={6}>
              <Typography>{option.description}</Typography>
            </Grid>
          </Grid>
        )}
        renderTags={() => null}
        value={features}
      />
      <List dense>
        {features.map((feature, idx) => (
          <ListItem
            className={classes.listItem}
            key={idx}
            style={{ backgroundColor: feature.colour! }}
          >
            <ListItemText>
              <Typography>{feature.description}</Typography>
            </ListItemText>
            <ListItemSecondaryAction>
              <IconButton
                onClick={(event: React.MouseEvent<{}>) => {
                  let newFeatures = features.filter(
                    (features, featureIdx) => idx !== featureIdx
                  );
                  setFeatures(newFeatures);
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
