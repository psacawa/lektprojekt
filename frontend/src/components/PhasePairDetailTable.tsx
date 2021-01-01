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

interface Props {
  pk: number;
}
import * as client from "../client";

const PhrasePairDetailTable = ({ pk }: Props) => {
  const phrasePairQuery = useQuery(["pair", pk], () => client.getPair(pk), {});
  return (
    <>
      {phrasePairQuery.isSuccess ? (
        <TableContainer>
          <Table size="small">
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
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default PhrasePairDetailTable;
