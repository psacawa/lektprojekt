import { Grid, IconButton, makeStyles, Paper } from "@material-ui/core";
import { Clear } from "@material-ui/icons";
import { difference, random } from "lodash";
import React from "react";

import { Annotation, Coloured, Language, Lexeme } from "../types";
import AnnotationSelect from "./AnnotationSelect";
import LexemeSelect from "./LexemeSelect";

interface Props {
  language: Language | null;
  lexemes: Coloured<Lexeme>[];
  annotations: Annotation[];
  setLexemes: React.Dispatch<Lexeme[]>;
  setAnnotations: React.Dispatch<Annotation[]>;
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
  annotations,
  setAnnotations,
  language,
}: Props) => {
  const classes = useStyles();

  const getRandomUnusedColour = () => {
    let currentColours = (lexemes as Coloured<Lexeme | Annotation>[])
      .concat(annotations)
      .map((feature) => feature.colour);
    let availableColours = difference(lightColours, currentColours);
    return availableColours[random(availableColours.length)];
  };

  return (
    <>
      <LexemeSelect
        disabled={false}
        language={language}
        value={lexemes}
        setValue={setLexemes}
        onChange={(event, newLexemes, reason) => {
          if (newLexemes.length > lexemes.length) {
            let idx = newLexemes.length - 1;
            newLexemes[idx].colour = getRandomUnusedColour();
            setLexemes(newLexemes);
          }
        }}
      />
      <AnnotationSelect
        disabled={false}
        language={language}
        value={annotations}
        setValue={setAnnotations}
        onChange={(event, newAnnotations, reason) => {
          if (newAnnotations.length > annotations.length) {
            let idx = newAnnotations.length - 1;
            newAnnotations[idx].colour = getRandomUnusedColour();
            setAnnotations(newAnnotations);
          }
        }}
      />
    </>
  );
};

export default PhrasePairSearchOptions;
