import { difference, random } from "lodash";
import React, { useState } from "react";
import { Coloured, Feature, Language, Lexeme } from "types";
import { getLogger } from "utils";

const logger = getLogger("SearchContext");

interface SearchContext {
  baseLanguage: Language | null;
  setBaseLanguage: React.Dispatch<Language | null>;
  targetLanguage: Language | null;
  setTargetLanguage: React.Dispatch<Language | null>;
  lexemes: Coloured<Lexeme>[];
  setLexemes: React.Dispatch<Coloured<Lexeme>[]>;
  features: Coloured<Feature>[];
  setFeatures: React.Dispatch<Coloured<Feature>[]>;
  pageNumber: number;
  setPageNumber: React.Dispatch<number>;
  rowsPerPage: number;
  setRowsPerPage: React.Dispatch<number>;
  lexemeOptions: Lexeme[];
  setLexemeOptions: React.Dispatch<Lexeme[]>;
  featureOptions: Feature[];
  setFeatureOptions: React.Dispatch<Feature[]>;
  getRandomUnusedColour: () => string | undefined;
  resetSearch: () => void;
  resetPagination: () => void;
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

const SearchContext = React.createContext<SearchContext>({} as SearchContext);

export const SearchContextProvider = (props: any) => {
  const [baseLanguage, setBaseLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [lexemes, setLexemes] = useState<Coloured<Lexeme>[]>([]);
  const [features, setFeatures] = useState<Coloured<Feature>[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [rowsPerPage, _setRowsPerPage] = useState(20);
  const [lexemeOptions, setLexemeOptions] = useState<Lexeme[]>([]);
  const [featureOptions, setFeatureOptions] = useState<Feature[]>([]);

  const getRandomUnusedColour = () => {
    let currentColours = (lexemes as Coloured<Lexeme | Feature>[])
      .concat(features)
      .map((feature) => feature.colour);
    let availableColours = difference(lightColours, currentColours);
    // NOTE 21/09/20 psacawa: _.random is inclusive of both bounds
    return availableColours[random(availableColours.length - 1)];
  };

  const resetSearch = () => {
    setLexemeOptions([]);
    setLexemes([]);
    setFeatures([]);
    setFeatureOptions([]);
    resetPagination();
  };

  function resetPagination() {
    setPageNumber(0);
    _setRowsPerPage(20);
  }

  function setRowsPerPage(n: number) {
    _setRowsPerPage(n);
    setPageNumber(0);
  }

  return (
    <SearchContext.Provider
      value={{
        baseLanguage,
        setBaseLanguage,
        targetLanguage,
        setTargetLanguage,
        lexemes,
        setLexemes,
        features,
        setFeatures,
        pageNumber,
        setPageNumber,
        rowsPerPage,
        setRowsPerPage,
        lexemeOptions,
        setLexemeOptions,
        featureOptions,
        setFeatureOptions,
        getRandomUnusedColour,
        resetSearch,
        resetPagination,
      }}
      {...props}
    ></SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  let value = React.useContext(SearchContext);
  if (value === undefined) {
    throw new Error("Use useSearchContext within SearchContextProvider");
  }
  return value;
};
