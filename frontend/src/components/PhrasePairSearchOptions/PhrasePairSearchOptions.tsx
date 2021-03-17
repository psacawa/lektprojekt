import { makeStyles } from "@material-ui/core";
import FeatureSelect from "components/FeatureSelect";
import LexemeSelect from "components/LexemeSelect";
import { difference, random } from "lodash";
import React from "react";
import { Coloured, Feature, Language, Lexeme } from "types";

interface Props {
  language: Language | null;
  lexemes: Coloured<Lexeme>[];
  features: Feature[];
  setLexemes: React.Dispatch<Lexeme[]>;
  setFeatures: React.Dispatch<Feature[]>;
  setPageNumber: React.Dispatch<number>;
}

const lightColours = [
  "#ffe082",
  "#b0bec5",
  "#bcaaa4",
  "#80deea",
  "#ffab91",
  "#90caf9",
  "#b39ddb",
  "#a5d6a7",
  "#9fa8da",
  "#81d4fa",
  "#c5e1a5",
  "#e6ee9c",
  "#ffcc80",
  "#f48fb1",
  "#ce93d8",
  "#ef9a9a",
  "#80cbc4",
  "#fff59d",
];

const useStyles = makeStyles(() => ({
  row: {
    maxWidth: "auto",
  },
}));

const PhrasePairSearchOptions = ({
  lexemes,
  setLexemes,
  features,
  setFeatures,
  language,
  setPageNumber,
}: Props) => {
  const classes = useStyles();

  const getRandomUnusedColour = () => {
    let currentColours = (lexemes as Coloured<Lexeme | Feature>[])
      .concat(features)
      .map((feature) => feature.colour);
    let availableColours = difference(lightColours, currentColours);
    return availableColours[random(availableColours.length)];
  };

  return (
    <>
      <LexemeSelect
        language={language}
        value={lexemes}
        setValue={setLexemes}
        onChange={(event, newLexemes, reason) => {
          if (newLexemes.length > lexemes.length) {
            let idx = newLexemes.length - 1;
            newLexemes[idx].colour = getRandomUnusedColour();
            setLexemes(newLexemes);
            setPageNumber(1);
          }
        }}
      />
      <FeatureSelect
        language={language}
        value={features}
        setValue={setFeatures}
        onChange={(event, newFeatures, reason) => {
          if (newFeatures.length > features.length) {
            let idx = newFeatures.length - 1;
            newFeatures[idx].colour = getRandomUnusedColour();
            setFeatures(newFeatures);
            setPageNumber(1);
          }
        }}
      />
    </>
  );
};

export default PhrasePairSearchOptions;
