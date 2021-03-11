import {
  CircularProgress,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import { usePair } from "../hooks";

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
                <TableCell key={0}> Text </TableCell>
                <TableCell key={1}> Base Form </TableCell>
                <TableCell key={2}> Part of Speech </TableCell>
                <TableCell key={3}> Grammar </TableCell>
              </TableRow>
            </TableHead>
            {phrasePairQuery.data.target.words?.map((word, idx) => (
              <TableRow key={idx}>
                <TableCell key={0}>{word.norm}</TableCell>
                <TableCell key={1}>
                  <Link to={`/lexemes/${word.lexeme?.id}/`}>
                    {word.lexeme?.lemma}
                  </Link>
                </TableCell>
                <TableCell key={2}>{word.lexeme?.pos}</TableCell>
                <TableCell key={3}>
                  {word.features.map((feature, idx) => (
                    <>
                      <Link key={idx} to={`/features/${feature.id}/`}>
                        {feature.description}
                      </Link>{" "}
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
