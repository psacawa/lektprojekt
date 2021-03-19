import {
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { usePair, useScoreQuestion, useTrainingPlan } from "hooks";
import React, { useReducer, useState } from "react";
import { useQueryClient } from "react-query";
import { Redirect, useHistory, useParams } from "react-router-dom";

interface ItemProps {
  list_id: number;
  pair_id: number;
}

const useStyles = makeStyles({
  center: {
    textAlign: "center",
  },
  margin: {
    margin: "10px",
  },
  progress: {},
});

const grades = ["Wrong", "Hard", "OK", "Good", "Easy"];
// eventually, the state of the practice should be availabe globally - perhaps redux
const PracticeView = () => {
  const queryClient = useQueryClient();
  const history = useHistory();
  const { id: list_id } = useParams<{ id?: any }>();
  const classes = useStyles();
  const planQuery = useTrainingPlan(
    { list_id, page_size: 20 },
    { staleTime: Infinity }
  );
  const [currentPairIdx, setCurrentPairIdx] = useState<number>(0);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const scoreQuestion = useScoreQuestion();
  return (
    <>
      {planQuery.isSuccess ? (
        <>
          {currentPairIdx in planQuery.data ? (
            <div className={classes.center}>
              <Typography variant="h4" className={classes.margin}>
                {planQuery.data[currentPairIdx].base.text}
              </Typography>
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

export default PracticeView;
