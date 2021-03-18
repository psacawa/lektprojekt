import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { usePair } from "hooks";
import React from "react";
import { Link } from "react-router-dom";

interface Props {
  id: number;
}

const PhrasePairDetailTable = ({ id }: Props) => {
  const phrasePairQuery = usePair({ id });
  return (
    <>
      {phrasePairQuery.isSuccess ? (
        <TableContainer key={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell> Text </TableCell>
                <TableCell> Base Form </TableCell>
                <TableCell> Part of Speech </TableCell>
                <TableCell> Grammar </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phrasePairQuery.data.target.words?.map((word, idx) => (
                <TableRow key={idx}>
                  <TableCell>{word.norm}</TableCell>
                  <TableCell>
                    <Link to={`/lexemes/${word.lexeme.id}/`}>
                      {word.lexeme.lemma}
                    </Link>
                  </TableCell>
                  <TableCell>{word.lexeme.pos}</TableCell>
                  <TableCell>
                    {word.features.map((feature, idx) => (
                      <Link key={idx} to={`/features/${feature.id}/`}>
                        {feature.description}
                      </Link>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default PhrasePairDetailTable;
