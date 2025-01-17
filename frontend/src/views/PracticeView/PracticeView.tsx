import {
  Button,
  CircularProgress,
  Divider,
  LinearProgress,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { drawerWidth } from "assets/jss/base";
import { useCourses, useScoreQuestion, useTrainingPlan } from "hooks";
import { useSession } from "hooks/session";
import React, { useEffect, useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { useQueryClient } from "react-query";
import { Redirect, useHistory, useParams } from "react-router-dom";
import { LanguageCourse, PhrasePair } from "types";
import { getAudioUrl } from "utils";

const grades = ["Wrong", "Hard", "OK", "Good", "Easy"];

const useStyles = makeStyles({
  center: {
    textAlign: "center",
  },
  margin: {
    margin: "10px",
  },
  progress: {},
  alert: {
    transform: `translate(${drawerWidth}px, 0px)`,
  },
});

const PracticeView = () => {
  const { session } = useSession();
  const history = useHistory();
  return (
    <>
      {session.currentTrackedList === undefined ? (
        <SweetAlert
          onConfirm={() => {
            history.push("/courses/");
          }}
          title="No language/training plan chosen"
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
  course: LanguageCourse<true>;
  listId: number;
}

const PracticePrompt = ({ course, pair }: PromptProps) => {
  const classes = useStyles();
  const audioUrl = getAudioUrl(course.base_voice, pair.base);
  return (
    <>
      <audio autoPlay controls src={audioUrl}>
        Audio element not supported.
      </audio>
      <Typography className={classes.margin} variant="h4">
        {pair.base.text}
      </Typography>
    </>
  );
};

interface AnswerProps extends PromptProps {
  setCurrentPairIdx: React.Dispatch<React.SetStateAction<number>>;
  setQuestionAnswered: React.Dispatch<boolean>;
}

const PracticeAnswer = ({
  pair,
  course,
  listId,
  setCurrentPairIdx,
  setQuestionAnswered,
}: AnswerProps) => {
  const classes = useStyles();
  const audioUrl = getAudioUrl(course.target_voice, pair.target);
  const scoreQuestion = useScoreQuestion();
  return (
    <>
      <Divider />

      <audio autoPlay controls src={audioUrl}>
        Audio element not supported.
      </audio>
      <Typography className={classes.margin} variant="h4">
        {pair.target.text}
      </Typography>
      <Typography className={classes.margin} component="div" variant="body1">
        Select grade:
      </Typography>
      <div className={classes.margin}>
        {grades.map((grade, idx) => (
          <>
            <Button
              onClick={async (ev: React.MouseEvent<HTMLElement>) => {
                await scoreQuestion.mutateAsync({
                  list_id: listId,
                  phrase_id: pair.target.id,
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
  );
};

// eventually, the state of the practice should be availabe globally - perhaps redux
const ListPracticeView = () => {
  const queryClient = useQueryClient();
  const { setSession } = useSession();
  const history = useHistory();
  const listId = parseInt(useParams<{ id: string }>().id);
  const classes = useStyles();
  // TODO 21/03/20 psacawa: figure out how to gracefully type selector so this data can be
  // moved out of component state
  const coursesQuery = useCourses();

  const course =
    coursesQuery.data &&
    coursesQuery.data.results.find((course) =>
      course.lists.find((list) => list.id === listId)
    );
  const planQuery = useTrainingPlan(
    { list_id: listId, page_size: 20 },
    { staleTime: Infinity }
  );
  // set the current tracked list to the current one upon entering Practice mode
  // TODO 21/03/20 psacawa: find a nicer solution for this
  useEffect(() => {
    setSession({ currentTrackedList: listId });
    return () => {};
  }, [listId, setSession]);
  const [currentPairIdx, setCurrentPairIdx] = useState<number>(0);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  return (
    <>
      {planQuery.isSuccess && course ? (
        <>
          {currentPairIdx in planQuery.data ? (
            <div className={classes.center}>
              <PracticePrompt
                course={course}
                listId={listId}
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
                <PracticeAnswer
                  course={course}
                  pair={planQuery.data[currentPairIdx]}
                  {...{ listId, setQuestionAnswered, setCurrentPairIdx }}
                />
              )}
              <LinearProgress
                className={classes.progress}
                value={(currentPairIdx / planQuery.data.length) * 100}
                variant="determinate"
              />
            </div>
          ) : (
            <div className={`${classes.center} `}>
              <Typography className={classes.margin} variant="h4">
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
                  history.push(`/lists/${listId}`);
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
