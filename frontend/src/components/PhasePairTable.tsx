import {
  Grid,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@material-ui/core";
import { Language, PhrasePair } from "../types";

interface Props {
  baseLanguage: Language | undefined;
  targetLanguage: Language | undefined;
  phrasePairs: PhrasePair[];
  enabled: boolean;
}

const PhrasePairTable = ({
  enabled,
  baseLanguage,
  targetLanguage,
  phrasePairs,
}: Props) => {
  return (
    <Grid item xs={12} justify="center">
      {phrasePairs.length > 0 ? (
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
            {phrasePairs?.map((phrasePair) => (
              <TableRow>
                <TableCell key={0}>{phrasePair.base.text}</TableCell>
                <TableCell key={1}>{phrasePair.target.text}</TableCell>
              </TableRow>
            ))}
          </Table>
        </TableContainer>
      ) : (
        <CircularProgress />
      )}
    </Grid>
  );
};

export default PhrasePairTable;
