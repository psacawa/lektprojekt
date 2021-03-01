import {
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React, { Component } from "react";

import { useTrackedFeatures, useTrackedLexemes } from "../clientHooks";
import { TrackedList } from "../types";

interface Props {
  list: TrackedList;
}

const TrackedListDisplay = ({ list }: Props) => {
  const lexemeQuery = useTrackedLexemes({ id: list.id });
  const featureQuery = useTrackedFeatures({ id: list.id });
  return (
    <>
      {lexemeQuery.isSuccess ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Lexeme</TableCell>
                <TableCell>Part of Speech</TableCell>
                <TableCell>Difficulty</TableCell>
              </TableRow>
            </TableHead>
            {lexemeQuery.data.results.map((tracked, idx) => (
              <TableRow>
                <TableCell>{tracked.observable.lemma}</TableCell>
                <TableCell>{tracked.observable.pos}</TableCell>
                <TableCell>{tracked.difficulty}</TableCell>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
      ) : (
        <>false block</>
      )}
    </>
  );
};

export default TrackedListDisplay;
