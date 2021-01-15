import {
  CircularProgress,
  Link,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { useQuery } from "react-query";

import * as client from "../client";

interface Props {
  pk: number;
}

const PhrasePairDetailTable = ({ pk }: Props) => {
  const phrasePairQuery = useQuery(["pair", pk], () => client.getPair(pk), {});
  return (
    <>
      {phrasePairQuery.isSuccess ? (
        <TableContainer key={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell key={0}> Text </TableCell>
                <TableCell key={1}> Base Form </TableCell>
                <TableCell key={2}> Part of Speech </TableCell>
                <TableCell key={3}> Grammar </TableCell>
              </TableRow>
            </TableHead>
            {phrasePairQuery.data.target.words?.map((word, idx) => (
              <TableRow key={idx}>
                <TableCell key={0}>{word.norm}</TableCell>
                <TableCell key={1}>{word.lexeme.lemma}</TableCell>
                <TableCell key={2}>{word.lexeme.pos}</TableCell>
                <TableCell key={3}>
                  {word.annotations.map((annot, idx) => (
                    <>
                      <Link key={idx}>{annot.description}</Link>{" "}
                    </>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default PhrasePairDetailTable;
