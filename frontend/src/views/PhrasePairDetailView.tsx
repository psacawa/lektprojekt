import { useParams } from "react-router-dom";
import * as client from "../client";
import { useQuery } from "react-query";
import {
  CircularProgress,
  Link,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React from "react";

interface Props {
  pk: number;
}

const PhrasePairDetailView = () => {
  const { pk } = useParams<any>();
  const phrasePairQuery = useQuery(["pair", pk], () => client.getPair(pk), {});
  return (
    <>
      {phrasePairQuery.isSuccess ? (
        <>
          <Typography variant="h6">
            {phrasePairQuery.data.base!.text}
          </Typography>
          <Typography variant="h5">
            {phrasePairQuery.data.target!.text}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell> Text </TableCell>
                  <TableCell> Base Form </TableCell>
                  <TableCell> Part of Speech </TableCell>
                  <TableCell> Grammar </TableCell>
                </TableRow>
              </TableHead>
              {phrasePairQuery.data.target.words?.map((word, idx) => (
                <TableRow>
                  <TableCell>{word.norm}</TableCell>
                  <TableCell>{word.lexeme.lemma}</TableCell>
                  <TableCell>{word.lexeme.pos}</TableCell>
                  <TableCell>
                    {word.annotations.map((annot, idx) => (
                      <>
                        <Link>{annot.explanation}</Link>{" "}
                      </>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </TableContainer>
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default PhrasePairDetailView;
