import {
  CircularProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { Card, CardContent } from "@material-ui/core";
import cardBodyStyles from "assets/jss/styles/components/cardBodyStyle";
import cardStyles from "assets/jss/styles/components/cardStyle";
import { GridContainer, GridItem } from "components/Grid";
import {
  useCreateCourse,
  useLanguages,
  usePairCounts,
  useSupportedLanguagePairs,
} from "hooks";
import { find, includes } from "lodash";
import _ from "lodash";
import React from "react";
import { Redirect } from "react-router";
import { Language } from "types";

const useStyles = makeStyles({
  ...cardStyles,
  ...cardBodyStyles,
  container: {
    maxWidth: 800,
    margin: "auto",
  },
  center: {
    textAlign: "center",
  },
  flagIcon: {
    padding: "20%",
  },
  cta: {
    margin: "20px",
  },
  list: {
    listStyleType: "none",
  },
});

const HomeView = () => {
  const classes = useStyles();
  return (
    <div className={classes.center}>
      <Typography variant="h2">
        Welcome to <b>{process.env.REACT_NAME}</b>
      </Typography>
      <Typography className={classes.cta} variant="h4">
        Start your language-learning journey!
      </Typography>
      <LanguagePairSelectWidget />
    </div>
  );
};

// just extract the flag code from the default voice's locale and return it
// alongside the language itself
// {"id": 3, "lid": "en", ...} =>  {"flagCode": "US", "id": 3, "lid": "en", ... }
const addDefaultLocaleCode = (language: Language) => {
  const defaultVoice = find(
    language.voice_set,
    (voice, idx) => voice.id === language.default_voice
  );
  const flagCode = defaultVoice!.aid.slice(3);
  return {
    flagCode,
    ...language,
  };
};

// This component implements a two-step select of 1. target, 2. base language.
// Step is stored in selectionStep
export const LanguagePairSelectWidget = () => {
  const classes = useStyles();
  const languageQuery = useLanguages();
  const supportedLanguagePairQuery = useSupportedLanguagePairs();
  const [selectionStep, setSelectionStep] = React.useState<
    "base" | "target" | "done"
  >("target");
  const [targetLanguage, setTargetLanguage] = React.useState<
    Language | undefined
  >(undefined);

  // the options for the current step are stored in languageOptions
  const languageIdOptions =
    supportedLanguagePairQuery.data &&
    _(supportedLanguagePairQuery.data)
      .filter(
        (pair) =>
          (targetLanguage && targetLanguage.id === pair.target_lang) ||
          targetLanguage === undefined
      )
      .map((pair) =>
        selectionStep === "base"
          ? pair.base_lang
          : selectionStep === "target"
          ? pair.target_lang
          : 0
      )
      .uniq()
      .value();
  const languageOptions = languageQuery.data
    ?.filter((lang) => includes(languageIdOptions, lang.id))
    .map(addDefaultLocaleCode);

  const createCourse = useCreateCourse();
  return (
    <>
      {!languageOptions || !languageQuery.data ? (
        <CircularProgress />
      ) : selectionStep === "target" ? (
        <>
          <h4>I'm learning...</h4>
          <GridContainer
            className={classes.container}
            justifyContent="space-around"
          >
            {languageOptions.map((lang, idx) => (
              <GridItem key={idx} md={3} sm={4} xs={6}>
                <Card
                  className={`${classes.card} ${classes.center}`}
                  key={idx}
                  onClick={(event: React.MouseEvent) => {
                    setTargetLanguage(lang);
                    setSelectionStep("base");
                  }}
                >
                  <CardContent className={classes.cardBody}>
                    {lang.name}
                  </CardContent>
                  <input
                    alt={lang.flagCode}
                    className={classes.cardBody}
                    src={`/flags/${lang.flagCode}.png`}
                    type="image"
                  />
                </Card>
              </GridItem>
            ))}
          </GridContainer>
        </>
      ) : selectionStep === "base" ? (
        <>
          <h4>I speak...</h4>
          <GridContainer
            className={classes.container}
            justifyContent="space-around"
          >
            {languageOptions.map((lang, idx) => (
              <GridItem key={idx} md={3} sm={4} xs={6}>
                <Card
                  className={`${classes.card} ${classes.center}`}
                  onClick={async (event: React.MouseEvent) => {
                    createCourse.mutate({
                      base_lang: lang.id,
                      base_voice: lang.default_voice,
                      target_lang: targetLanguage!.id,
                      target_voice: targetLanguage!.default_voice,
                    });
                    setSelectionStep("done");
                  }}
                >
                  <CardContent className={classes.cardBody}>
                    {lang.name}
                  </CardContent>
                  <input
                    alt={lang.flagCode}
                    className={classes.cardBody}
                    src={`/flags/${lang.flagCode}.png`}
                    type="image"
                  />
                </Card>
              </GridItem>
            ))}
          </GridContainer>
        </>
      ) : (
        <Redirect push to="courses/" />
      )}
    </>
  );
};

// eslint-disable-next-line  @typescript-eslint/no-unused-vars
export const PhrasePairCountsTable = () => {
  const classes = useStyles();
  const pairCountsQuery = usePairCounts();
  return (
    <div className={classes.center}>
      {pairCountsQuery.isSuccess && (
        <>
          <h5>Current phrase pair counts in database:</h5>
          <TableContainer className={classes.container}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Base Language</TableCell>
                  <TableCell>Target Language</TableCell>
                  <TableCell>Phrase Pair Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pairCountsQuery.data.map((stat, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{stat.base_lang}</TableCell>
                    <TableCell>{stat.target_lang}</TableCell>
                    <TableCell>{stat.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default HomeView;
