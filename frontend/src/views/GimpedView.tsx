import { Button, debounce, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { CircularProgress } from "@material-ui/core";
import * as client from "../client";
import { Language, Lexeme, PhrasePair } from "../types";
import AsyncWordSelect from "../components/AsyncWordSelect";
import LanguageSelect from "../components/LanguageSelect";
import PhasePairTable from "../components/PhasePairTable";

const GimpedView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | undefined>(
    undefined
  );
  const [targetLanguage, setTargetLanguage] = useState<Language | undefined>(
    undefined
  );
  const [options, setOptions] = useState<Lexeme[]>([]);
  const [phrasePairs, setPhrasePairs] = useState<PhrasePair[]>([]);
  const [resultsShown, setResultsShown] = useState(false);
  const [promptValue, setPromptValue] = useState<Lexeme>();
  const [promptInputValue, setPromptInputValue] = useState<string>("");

  const languagesQuery = useQuery("languages", client.listLanguages, {
    onSuccess: (languages) => {
      setBaseLanguage(languages.find((lang) => lang.lid === "en"));
      setTargetLanguage(languages.find((lang) => lang.lid === "es"));
    },
    refetchOnWindowFocus: false,
  });
  const handleInputChange = debounce(
    (event: React.ChangeEvent, newInputValue: string) =>
      setPromptInputValue(newInputValue),
    300
  );
  const handleClick = (ev: React.MouseEvent) => {
    client
      .getSuggestions(baseLanguage!.lid, targetLanguage!.lid, promptValue!.id)
      .then((phrasePairs) => setPhrasePairs(phrasePairs));
    setResultsShown(true);
  };
  return (
    <>
      <Typography variant="h5" style={{ margin: 30 }}>
        Welcome to Gimped Mode
      </Typography>
      {languagesQuery.isFetching ? (
        <CircularProgress />
      ) : (
        <>
          <Grid justify="center" container spacing={4}>
            <LanguageSelect
              baseLanguage={baseLanguage}
              handleBaseLanguageChange={(ev, newLang) => {
                setBaseLanguage(newLang);
              }}
              targetLanguage={targetLanguage}
              handleTargetLanguageChange={(ev, newLang) => {
                setTargetLanguage(newLang);
                setOptions([]);
              }}
              languageOptions={languagesQuery!.data!}
            />
            <AsyncWordSelect
              onInputChange={handleInputChange}
              targetLanguage={targetLanguage}
              options={options}
              setOptions={setOptions}
              disabled={!targetLanguage}
              value={promptValue}
              inputValue={promptInputValue}
              setValue={setPromptValue}
            />
            <Grid item>
              <Button
                disabled={!(baseLanguage && targetLanguage && promptValue)}
                variant="contained"
                size="large"
                onClick={handleClick}
              >
                Search
              </Button>
            </Grid>
            {resultsShown ? (
              <PhasePairTable
                enabled={phrasePairs.length > 0}
                {...{ baseLanguage, targetLanguage, phrasePairs }}
              />
            ) : null}
          </Grid>
        </>
      )}
    </>
  );
};

export default GimpedView;
