import { debounce, Grid, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { CircularProgress } from "@material-ui/core";
import * as client from "../client";
import { Language, Lexeme, PhrasePair } from "../types";
import AsyncWordSelect from "../components/AsyncWordSelect";
import LanguageSelect from "../components/LanguageSelect";
import PhasePairTable from "../components/PhasePairTable";

const GimpedView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<Language | null>(null);
  const [options, setOptions] = useState<Lexeme[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [promptValue, setPromptValue] = useState<Lexeme | null>(null);
  const [promptInputValue, setPromptInputValue] = useState<string>("");

  const languageQuery = useQuery("languages", client.listLanguages, {
    onSuccess: (languages) => {
      setBaseLanguage(languages.find((lang) => lang.lid === "en") ?? null);
      setTargetLanguage(languages.find((lang) => lang.lid === "es") ?? null);
    },
    refetchOnWindowFocus: false,
  });
  const phrasePairQuery = useQuery(
    ["pairs", [baseLanguage?.lid, targetLanguage?.lid, promptValue?.id]],
    () =>
      client.getPairs(baseLanguage!.lid, targetLanguage!.lid, promptValue!.id),
    {
      enabled,
    }
  );
  const handleInputChange = debounce(
    (event: React.ChangeEvent, newInputValue: string) =>
      setPromptInputValue(newInputValue),
    300
  );
  const handleChange = (ev: React.ChangeEvent<{}>, newValue: Lexeme | null) => {
    if (newValue) {
      newValue && setPromptValue(newValue);
      !enabled && setEnabled(true);
    }
  };
  return (
    <>
      <Typography variant="h5" style={{ margin: 30 }}>
        Welcome to Gimped Mode
      </Typography>
      {languageQuery.isFetching ? (
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
              languageOptions={languageQuery!.data!}
            />
            <AsyncWordSelect
              onInputChange={handleInputChange}
              targetLanguage={targetLanguage}
              options={options}
              setOptions={setOptions}
              disabled={!targetLanguage}
              value={promptValue}
              inputValue={promptInputValue}
              onChange={handleChange}
            />
            <Grid item></Grid>
            {enabled ? (
              <PhasePairTable
                {...{ baseLanguage, targetLanguage, phrasePairQuery }}
              />
            ) : null}
          </Grid>
        </>
      )}
    </>
  );
};

export default GimpedView;
