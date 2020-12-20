import {
  Button,
  debounce,
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { CircularProgress } from "@material-ui/core";
import * as client from "../client";
import { Language, Lexeme, PhrasePair } from "../types";
import { Autocomplete } from "@material-ui/lab";
import AsyncWordSelect from "../components/AsyncWordSelect";
import LanguageSelect from "../components/LanguageSelect";

const GimpedView = () => {
  const [baseLanguage, setBaseLanguage] = useState<Language | undefined>(
    undefined
  );
  const [targetLanguage, setTargetLanguage] = useState<Language | undefined>(
    undefined
  );
  const [options, setOptions] = useState<Lexeme[]>([]);
  const [phrasePairs, setPhrasePairs] = useState<PhrasePair[]>([]);
  const [promptValue, setPromptValue] = useState<Lexeme>();
  const [promptInputValue, setPromptInputValue] = useState<string>("");
  const [phrasePairsEnabled, setPhrasePairsEnabled] = useState(false);

  const languagesQuery = useQuery("languages", client.listLanguages, {
    onSuccess: (data) => {
      setBaseLanguage(data.find((lang) => lang.lid === "en"));
      setTargetLanguage(data.find((lang) => lang.lid === "es"));
    },
    refetchOnWindowFocus: false,
  });
  const handleInputChange: any = debounce(
    (event: any, newInputValue: string) => setPromptInputValue(newInputValue),
    300
  );
  const handleClick = (ev: React.MouseEvent) =>
    client
      .getSuggestions(baseLanguage!.lid, targetLanguage!.lid, promptValue!.id)
      .then((phrasePairs) => setPhrasePairs(phrasePairs));
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
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell key={0} align="left">
                      {baseLanguage?.name}
                    </TableCell>
                    <TableCell key={1} align="left">
                      {targetLanguage?.name}
                    </TableCell>
                  </TableRow>
                </TableHead>
                {phrasePairs?.map((phrasePair, idx) => (
                  <TableRow>
                    <TableCell key={0}>{phrasePair.base.text}</TableCell>
                    <TableCell key={1}>{phrasePair.target.text}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </TableContainer>
          </Grid>
        </>
      )}
    </>
  );
};

export default GimpedView;
