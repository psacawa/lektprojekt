import {
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Collapse,
  Box,
  makeStyles,
} from "@material-ui/core";
import PhrasePairDetailTable from "./PhasePairDetailTable";
import { Language, PhrasePair } from "../types";
import { useHistory, Link } from "react-router-dom";
import { QueryObserverResult } from "react-query";
import HighlightedPhrase from "./HighlightedPhrase";

import { KeyboardArrowUp, KeyboardArrowDown } from "@material-ui/icons";
import { useState } from "react";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

interface RowProps {
  phrasePair: PhrasePair;
}

const PhrasePairTableRow = ({ phrasePair }: RowProps) => {
  const [open, setOpen] = useState(false);
  const classes = useRowStyles();
  return (
    <>
      <TableRow className={classes.root} hover={true}>
        <TableCell key={0}>{phrasePair.base.text}</TableCell>
        <TableCell key={1}>
          <HighlightedPhrase phrase={phrasePair.target} />
        </TableCell>
        <TableCell key={2}>
          <IconButton onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={12}>
          <Collapse in={open} timeout="auto" unmountOnExit={true}>
            <Box>
              <PhrasePairDetailTable pk={phrasePair.id} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

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
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell key={0} align="left">
                  {baseLanguage?.name}
                </TableCell>
                <TableCell key={1} align="left">
                  {targetLanguage?.name}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {phrasePairs?.map((phrasePair, idx) => (
                <PhrasePairTableRow key={idx} phrasePair={phrasePair} />
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
