import {
  CircularProgress,
  Divider,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React, { Component } from "react";
import { useParams } from "react-router-dom";

import { useTrackedFeatures, useTrackedLexemes } from "../clientHooks";
import { TrackedList } from "../types";

interface Props {
  list: TrackedList;
}

const useStyles = makeStyles({
  table: {
    margin: "10px",
  },
});

const TrackedListView = ({ list }: Props) => {
  const classes = useStyles();
  const { id } = useParams<{ id: any }>();
  {
    /* const subsQuery = useQ */
  }
  const lexemeQuery = useTrackedLexemes({ id });
  const featureQuery = useTrackedFeatures({ id });
  return (
    <>
      {lexemeQuery.isSuccess ? (
        <TableContainer className={classes.table} component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Word</TableCell>
                <TableCell>Part of Speech</TableCell>
                <TableCell>Difficulty</TableCell>
              </TableRow>
            </TableHead>
            {lexemeQuery.data.results.map((tracked, idx) => (
              <TableBody>
                <TableRow>
                  <TableCell>{tracked.observable.lemma}</TableCell>
                  <TableCell>{tracked.observable.pos}</TableCell>
                  <TableCell>{tracked.difficulty}</TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </TableContainer>
      ) : (
        <CircularProgress />
      )}
      {featureQuery.isSuccess ? (
        <TableContainer className={classes.table} component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Grammatical Feature</TableCell>
                <TableCell>Difficulty</TableCell>
              </TableRow>
            </TableHead>
            {featureQuery.data.results.map((tracked, idx) => (
              <TableBody>
                <TableRow>
                  <TableCell>{tracked.observable.description}</TableCell>
                  <TableCell>{tracked.difficulty}</TableCell>
                </TableRow>
              </TableBody>
            ))}
          </Table>
        </TableContainer>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default TrackedListView;
