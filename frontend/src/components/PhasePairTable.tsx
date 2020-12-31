import {
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@material-ui/core";
import { Language, PhrasePair } from "../types";
import { useHistory, Link } from "react-router-dom";
import { QueryObserverResult } from "react-query";
import HighlightedPhrase from "./HighlightedPhrase";

interface Props {
  baseLanguage: Language | null;
  targetLanguage: Language | null;
  phrasePairQuery: QueryObserverResult<PhrasePair[]>;
}

const PhrasePairTable = ({
  phrasePairQuery,
  baseLanguage,
  targetLanguage,
}: Props) => {
  const history = useHistory();
  const { data: phrasePairs, isSuccess } = phrasePairQuery;
  return (
    <Grid item xs={12}>
      {isSuccess ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell key={0} align="left">
                  {baseLanguage?.name}
                </TableCell>
                <TableCell key={1} align="left">
                  {targetLanguage?.name}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {phrasePairs?.map((phrasePair, idx) => (
                <TableRow key={idx}>
                  <TableCell key={0}>{phrasePair.base.text}</TableCell>
                  <TableCell key={1}>
                    <HighlightedPhrase phrase={phrasePair.target} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <CircularProgress />
      )}
    </Grid>
  );
};

export default PhrasePairTable;
