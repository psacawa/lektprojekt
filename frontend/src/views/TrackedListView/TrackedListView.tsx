import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  debounce,
  Grid,
  IconButton,
  Link as MuiLink,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@material-ui/core";
import { Clear, Edit } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { Field, Form, Formik } from "formik";
import { TextField as FormikTextField } from "formik-material-ui";
import {
  useFeatures,
  useLanguages,
  useLexemes,
  useTrackedFeatures,
  useTrackedLexemes,
  useTrackedList,
  useTrackObservable,
  useUntrackObservable,
  useUpdateTrackedList,
} from "hooks";
import { useSession } from "hooks/session";
import { isEqual, uniqWith } from "lodash";
import React, { useEffect, useState } from "react";
import { QueryObserverResult, useQueryClient } from "react-query";
import { Link, useHistory, useParams } from "react-router-dom";
import {
  Feature,
  Language,
  Lexeme,
  Observable,
  Paginate,
  Tracked,
  TrackedList,
} from "types";
import * as yup from "yup";

interface HeaderProps {
  list: TrackedList<true>;
  language?: Language;
}

const headerSchema: yup.SchemaOf<{ name: string }> = yup.object().shape({
  name: yup.string().required(),
});

const TrackedListHeader = ({ list, language }: HeaderProps) => {
  const queryClient = useQueryClient();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const updateList = useUpdateTrackedList();
  return (
    <>
      {!editingTitle ? (
        <Typography variant="h5">
          {list.name}
          <IconButton
            onClick={async (ev: React.MouseEvent<any>) => {
              setEditingTitle(true);
            }}
          >
            <Edit />
          </IconButton>
        </Typography>
      ) : (
        <Formik
          initialValues={{ name: "" }}
          onSubmit={async (values, bag) => {
            bag.setSubmitting(true);
            await updateList.mutateAsync({ id: list.id, name: values.name });
            await queryClient.refetchQueries(["lists", list.id]);
            await queryClient.refetchQueries(["courses"]);
            setEditingTitle(false);
            bag.setSubmitting(false);
          }}
          validationSchema={headerSchema}
        >
          <Form>
            <Field
              component={FormikTextField}
              label="New Training Plan Name"
              name="name"
            />
          </Form>
        </Formik>
      )}
      {language && <Typography variant="subtitle1">{language.name}</Typography>}
      <MuiLink component={Link} to="/profile/">
        back
      </MuiLink>
    </>
  );
};

const useStyles = makeStyles({
  table: {
    margin: "10px",
    maxWidth: 1000,
  },
  card: {
    minHeight: "20px",
  },
  listContainer: {
    maxWidth: "600px",
  },
});

interface Props {
  list: TrackedList;
}

const TrackedListView = ({ list }: Props) => {
  const classes = useStyles();
  const id = parseInt(useParams<{ id: string }>().id);
  const { session, setSession } = useSession();
  useEffect(() => {
    console.log(`setting tracked list: ${id}`);
    setSession({ currentTrackedList: id });
  }, [id]);
  const history = useHistory();
  const queryClient = useQueryClient();
  const listQuery = useTrackedList({ id });
  const languagesQuery = useLanguages();

  // available lexemes and auxiliary search queries
  const trackedLexemeQuery = useTrackedLexemes({ id });
  const [lexemeOptions, setLexemeOptions] = useState<Lexeme[]>([]);
  const [lexemeValue, setLexemeValue] = useState<Lexeme | undefined>(undefined);
  const [lexemeInputValue, setLexemeInputValue] = useState("");
  const lexemeSearchQuery = useLexemes(
    {
      lang: listQuery.data?.course.target_lang,
      prompt: lexemeInputValue,
    },
    {
      enabled: listQuery.isSuccess && lexemeInputValue.length >= 3,
      onSuccess: (results) => {
        const newOptions = uniqWith([...results, ...lexemeOptions], isEqual);
        setLexemeOptions(newOptions);
      },
    }
  );

  // available features and auxiliary search queries
  const trackedFeatureQuery = useTrackedFeatures({ id });
  const [featureOptions, setFeatureOptions] = useState<Feature[]>([]);
  const [featureValue, setFeatureValue] = useState<Feature | undefined>(
    undefined
  );
  const featureSearchQuery = useFeatures(
    {
      lang: listQuery.data!.course.target_lang,
    },
    {
      onSuccess: (results) => {
        setFeatureOptions(results);
      },
      enabled: listQuery.isSuccess,
    }
  );

  // refetch read queries involving observable_id
  const invalidateQueries = async (observable_id: number) => {
    const queries: Record<
      string,
      QueryObserverResult<Paginate<Tracked<Observable>>>
    > = {
      "tracked-lexemes": trackedLexemeQuery,
      "tracked-features": trackedFeatureQuery,
    };
    for (const key in queries) {
      await queryClient.refetchQueries([key]);
    }
  };
  // available features and auxiliary search queries
  const trackObservable = useTrackObservable({
    onSuccess: (data, variables, context) => {
      invalidateQueries(variables.observable_id);
    },
  });
  const untrackObservable = useUntrackObservable({
    onSuccess: (data, variables, context) => {
      invalidateQueries(variables.observable_id);
    },
  });
  return (
    <>
      {listQuery.isSuccess && languagesQuery.isSuccess ? (
        <>
          <TrackedListHeader
            language={languagesQuery.data.find(
              (lang) => lang.id === listQuery.data.course.target_lang
            )}
            list={listQuery.data}
          />
        </>
      ) : (
        <CircularProgress />
      )}
      {trackedLexemeQuery.isSuccess ? (
        <Grid className={classes.listContainer} item>
          <Autocomplete
            getOptionLabel={(option) => option.lemma}
            loading={lexemeSearchQuery.isFetching}
            onChange={(event, newValue, reason) => {
              newValue && setLexemeValue(newValue);
            }}
            onInputChange={debounce((event, newValue) => {
              setLexemeInputValue(newValue);
            }, 300)}
            options={lexemeOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {lexemeSearchQuery.isFetching ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                label="Add a word to track"
                variant="standard"
              />
            )}
            renderOption={(option) => (
              <Grid container>
                <Grid item xs={6}>
                  <Typography>{option.lemma}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{option.pos}</Typography>
                </Grid>
              </Grid>
            )}
            renderTags={() => null}
          />
          {lexemeValue && (
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5">{lexemeValue?.lemma}</Typography>
                <Typography variant="body2">placeholder for example</Typography>
                <Button
                  onClick={(event: React.MouseEvent<{}>) =>
                    lexemeValue &&
                    trackObservable.mutate({
                      id: listQuery.data!.id,
                      observable_id: lexemeValue!.id,
                    })
                  }
                >
                  Track
                </Button>
              </CardContent>
            </Card>
          )}
          <TableContainer className={classes.table} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Word</TableCell>
                  <TableCell>Part of Speech</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trackedLexemeQuery.data!.results.map((tracked, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{tracked.observable.lemma}</TableCell>
                    <TableCell>{tracked.observable.pos}</TableCell>
                    <TableCell>{tracked.score}</TableCell>
                    <TableCell>
                      {!untrackObservable.isLoading ? (
                        <IconButton
                          onClick={(ev) => {
                            untrackObservable.mutate({
                              id: listQuery.data!.id,
                              observable_id: tracked.observable.id,
                            });
                          }}
                        >
                          <Clear />
                        </IconButton>
                      ) : (
                        <CircularProgress />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ) : (
        <CircularProgress />
      )}
      {trackedFeatureQuery.isSuccess ? (
        <Grid className={classes.listContainer} item>
          <Autocomplete
            getOptionLabel={(option) => option.description}
            loading={featureSearchQuery.isFetching}
            onChange={(event, newValue, reason) => {
              newValue && setFeatureValue(newValue);
            }}
            options={featureOptions}
            renderInput={(params) => (
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {featureSearchQuery.isFetching ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                label="Add a grammatical feature to track"
                variant="standard"
              />
            )}
            renderOption={(option) => (
              <Grid container>
                <Grid item xs={6}>
                  <Typography>{option.description}</Typography>
                </Grid>
              </Grid>
            )}
          />
          {featureValue && (
            <Card className={classes.card}>
              <CardContent>
                <Typography variant="h5">{featureValue.description}</Typography>
                <Typography variant="body2">placeholder for example</Typography>
                <Button
                  onClick={(event: React.MouseEvent<{}>) =>
                    featureValue &&
                    trackObservable.mutate({
                      id: listQuery.data!.id,
                      observable_id: featureValue.id,
                    })
                  }
                >
                  Track
                </Button>
              </CardContent>
            </Card>
          )}
          <TableContainer className={classes.table} component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Feature</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trackedFeatureQuery.data!.results.map((tracked, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{tracked.observable.description}</TableCell>
                    <TableCell>{tracked.score}</TableCell>
                    <TableCell>
                      {!untrackObservable.isLoading ? (
                        <IconButton
                          onClick={(ev) => {
                            untrackObservable.mutate({
                              id: listQuery.data!.id,
                              observable_id: tracked.observable.id,
                            });
                          }}
                        >
                          <Clear />
                        </IconButton>
                      ) : (
                        <CircularProgress />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ) : (
        <CircularProgress />
      )}
      <Button
        onClick={(event: React.MouseEvent) =>
          history.push(`/lists/${id}/practice/`)
        }
        variant="contained"
      >
        Practice
      </Button>
    </>
  );
};

export default TrackedListView;
