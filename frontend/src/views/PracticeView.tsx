import {
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { usePair, useScoreQuestion, useSubs, useTrainingPlan } from "hooks";
import { useSession } from "hooks/session";
import { find } from "lodash";
import React, { useEffect, useReducer, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { useQueryClient } from "react-query";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { PhrasePair, Subscription } from "types";

const grades = ["Wrong", "Hard", "OK", "Good", "Easy"];

const useStyles = makeStyles({
  center: {
    textAlign: "center",
  },
  margin: {
    margin: "10px",
  },
  progress: {},
});

const PracticeView = () => {
  const { session } = useSession();
  const history = useHistory();
  return (
    <>
      {session.currentTrackedList === undefined ? (
        <SweetAlert
          title="No language/training plan chosen"
          onConfirm={() => {
            history.push("/profile/");
          }}
        >
          To start practicing, you need to select a langauge and a list of items
          to practice.
        </SweetAlert>
      ) : (
        <Redirect to={`/lists/${session.currentTrackedList}/practice/`} />
      )}
    </>
  );
};

interface PromptProps {
  pair: PhrasePair;
  subscription: Subscription<true>;
}

const PracticePrompt = ({ subscription, pair }: PromptProps) => {
  const classes = useStyles();
  const domain = process.env.REACT_APP_AUDIO_CDN_DOMAIN;
  const urlPhraseText = pair.base.text.replace(/[^\w]+/g, "-");
  const voice = subscription.base_voice.name;
  const audioUrl = `https://${domain}/${voice}/${urlPhraseText}.mp3`;
  return (
    <>
      <audio src={audioUrl}>Audio element not supported.</audio>
      <Typography variant="h4" className={classes.margin}>
        {pair.base.text}
      </Typography>
    </>
  );
};

// eventually, the state of the practice should be availabe globally - perhaps redux
const ListPracticeView = () => {
  const queryClient = useQueryClient();
  const [subscription, setSubscription] = useState<
    Subscription<true> | undefined
  >(undefined);
  const { setSession } = useSession();
  const history = useHistory();
  const list_id = parseInt(useParams<{ id: string }>().id);
  const classes = useStyles();
  // TODO 21/03/20 psacawa: figure out how to gracefully type selector so this data can be
  // moved out of component state
  const subsQuery = useSubs({
    onSuccess: (data) => {
      const sub = data.results.find((sub) =>
        sub.lists.find((list) => list.id === list_id)
      );
      setSubscription(sub);
    },
  });
  const planQuery = useTrainingPlan(
    { list_id, page_size: 20 },
    { staleTime: Infinity }
  );
  // set the current tracked list to the current one upon entering Practice mode
  // TODO 21/03/20 psacawa: find a nicer solution for this
  useEffect(() => {
    setSession({ currentTrackedList: list_id });
    return () => {};
  }, [list_id]);
  const [currentPairIdx, setCurrentPairIdx] = useState<number>(0);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const scoreQuestion = useScoreQuestion();
  // console.log (subscription)
  return (
    <>
      {planQuery.isSuccess && subscription ? (
        <>
          {currentPairIdx in planQuery.data ? (
            <div className={classes.center}>
              <PracticePrompt
                subscription={subscription}
                pair={planQuery.data[currentPairIdx]}
              />
              {!questionAnswered ? (
                <div className={classes.margin}>
                  <Button
                    onClick={(ev: React.MouseEvent<HTMLButtonElement>) => {
                      setQuestionAnswered(true);
                    }}
                  >
                    Show Answer
                  </Button>
                </div>
              ) : (
                <>
                  <Divider />
                  <Typography className={classes.margin} variant="h4">
                    {planQuery.data[currentPairIdx].target.text}
                  </Typography>
                  <Typography
                    className={classes.margin}
                    component="div"
                    variant="body1"
                  >
                    Select grade:
                  </Typography>
                  <div className={classes.margin}>
                    {grades.map((grade, idx) => (
                      <>
                        <Button
                          onClick={async (
                            ev: React.MouseEvent<HTMLElement>
                          ) => {
                            await scoreQuestion.mutateAsync({
                              list_id,
                              phrase_id:
                                planQuery.data[currentPairIdx].target.id,
                              grade: idx,
                            });
                            setQuestionAnswered(false);
                            setCurrentPairIdx((idx) => idx + 1);
                          }}
                        >
                          {grade}
                        </Button>
                      </>
                    ))}
                  </div>
                </>
              )}
              <LinearProgress
                className={classes.progress}
                variant="determinate"
                value={(currentPairIdx / planQuery.data.length) * 100}
              />
            </div>
          ) : (
            <div className={`${classes.center} `}>
              <Typography variant="h4" className={classes.margin}>
                Good job! You reached the end of the session!
              </Typography>
              <Button
                onClick={(ev: React.MouseEvent<HTMLElement>) => {
                  // TODO 19/03/20 psacawa: need more precise invalidation.
                  // Figure out how it works
                  queryClient.invalidateQueries(["plan"]);
                  setCurrentPairIdx(0);
                  setQuestionAnswered(false);
                }}
              >
                Restart
              </Button>
              <Button
                onClick={(ev: React.MouseEvent<unknown>) => {
                  history.push(`/lists/${list_id}`);
                }}
              >
                Edit List
              </Button>
              <Button
                onClick={(ev: React.MouseEvent<unknown>) => {
                  history.push("/profile/");
                }}
              >
                Profile
              </Button>
            </div>
          )}
        </>
      ) : (
        <CircularProgress className={classes.center} />
      )}
    </>
  );
};

export { ListPracticeView, PracticeView };
