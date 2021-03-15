import { IconButton, makeStyles } from "@material-ui/core";
import { Card, CardContent } from "@material-ui/core";
import { find } from "lodash";
import React from "react";
import { useHistory } from "react-router";

import flags from "../assets/img/flags";
import cardBodyStyles from "../assets/jss/styles/components/cardBodyStyle";
import cardStyles from "../assets/jss/styles/components/cardStyle";
import { GridContainer, GridItem } from "../components/Grid";
import { useCreateSubscription, useLanguages } from "../hooks";
import { Language } from "../types";

const useStyles = makeStyles({
  ...cardStyles,
  ...cardBodyStyles,
  container: {
    maxWidth: "1000px",
  },
  center: {
    textAlign: "center",
  },
  flagIcon: {
    padding: "20%",
  },
});

const getLanguages = (data: Language[]) =>
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

const Home = () => {
  const classes = useStyles();
  const history = useHistory();
  const languageQuery = useLanguages();
  const createSubscription = useCreateSubscription({
    onSettled: (data) => {
      history.push("/profile/");
    },
  });
  return (
    <>
      <h3>
        Welcome to <b>LektProjekt</b>, the most awesome website since ancient
        Sumer. Cowabunga!
      </h3>
      <h4>I'm learning...</h4>
      <GridContainer className={classes.container}>
        {languageQuery.data &&
          getLanguages(languageQuery.data).map((lang, idx) => (
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
          ))}
      </GridContainer>
    </>
  );
};

export default Home;
