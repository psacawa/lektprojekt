import {
  CircularProgress,
  IconButton,
  ListItem,
  makeStyles,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { Card, CardContent } from "@material-ui/core";
import cardBodyStyles from "assets/jss/styles/components/cardBodyStyle";
import cardStyles from "assets/jss/styles/components/cardStyle";
import { GridContainer, GridItem } from "components/Grid";
import {
  useCreateSubscription,
  useLanguages,
  usePairCounts,
  useSupportedLanguagePairs,
} from "hooks";
import { find, includes, uniq } from "lodash";
import React from "react";
import { useHistory } from "react-router";
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
  list: {
    listStyleType: "none",
  },
});

const Home = () => {
  const classes = useStyles();
  return (
    <div className={classes.center}>
      <h3>
        Welcome to <b>{process.env.REACT_NAME}</b>
      </h3>
      <p>which aims to let you practice your</p>
      <ul className={classes.list}>
        <li>
          <b>vocabulary</b>
        </li>
        <li>
          <b>grammar</b>
        </li>
        <li>
          <b>idioms</b> (to be added)
        </li>
      </ul>
      ...in the context of actual phrases in the language of your choice
      <LanguagePairSelectWidget />
      <PhrasePairCountsTable />
    </div>
  );
};

// just extract the flag code from the default voice's locale and return it
// alongside the language itself
// {"id": 3, "lid": "en", ...} =>  {"flagCode": "US", "id": 3, "lid": "en", ... }
const getDefaultLocaleCode = (data: Language[]) =>
  data.map((language, idx) => {
    const defaultVoice = find(
      language.voice_set,
      (voice, idx) => voice.id === language.default_voice
    );
    const flagCode = defaultVoice!.aid.slice(3);
    return {
      flagCode,
      ...language,
    };
  });

const LanguagePairSelectWidget = () => {
  const classes = useStyles();
  const history = useHistory();
  const languageQuery = useLanguages();
  const supportedLanguagePairQuery = useSupportedLanguagePairs();

  // extract the base languages from the supportedLanguagePairQuery response
  // these are taken as the id of the supportedLanguages
  const supportedLanguageIds: number[] = uniq(
    supportedLanguagePairQuery.data?.map(
      (languagePair) => languagePair.base_lang
    )
  );
  console.log(supportedLanguagePairQuery.data, supportedLanguageIds);
  const supportedLanguages = languageQuery.data?.filter((lang) =>
    includes(supportedLanguageIds, lang.id)
  );
  const createSubscription = useCreateSubscription({
    onSettled: (data) => {
      history.push("/profile/");
    },
  });
  return (
    <>
      <h4>I'm learning...</h4>
      <GridContainer
        justifyContent="space-around"
        className={classes.container}
      >
        {languageQuery.data &&
        supportedLanguagePairQuery.data &&
        supportedLanguages ? (
          getDefaultLocaleCode(supportedLanguages).map((lang, idx) => (
            <GridItem key={idx} xs={6} sm={4} md={3}>
              <Card
                className={`${classes.card} ${classes.center}`}
                onClick={async () => {
                  let enLang = find(languageQuery.data!, {
                    lid: "en",
                  }) as Language;
                  createSubscription.mutate({
                    base_lang: enLang.id,
                    base_voice: enLang.default_voice,
                    target_lang: lang.id,
                    target_voice: lang.default_voice,
                  });
                }}
              >
                <CardContent className={classes.cardBody}>
                  {lang.name}
                </CardContent>
                <input
                  className={classes.cardBody}
                  type="image"
                  src={`/flags/${lang.flagCode}.png`}
                />
              </Card>
            </GridItem>
          ))
        ) : (
          <CircularProgress />
        )}
      </GridContainer>
    </>
  );
};

const PhrasePairCountsTable = () => {
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

export default Home;
