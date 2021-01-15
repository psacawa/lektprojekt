import {
  Box,
  CircularProgress,
  Collapse,
  Grid,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import { KeyboardArrowDown, KeyboardArrowUp } from "@material-ui/icons";
import _ from "lodash";
import { useState } from "react";
import { QueryObserverResult } from "react-query";

import { Annotation, Coloured, Language, Lexeme, PhrasePair } from "../types";
import HighlightedPhrase from "./HighlightedPhrase";
import PhrasePairDetailTable from "./PhasePairDetailTable";

const useRowStyles = makeStyles({
  root: {
    "& > *": {
      borderBottom: "unset",
    },
  },
});

interface RowProps {
  phrasePair: PhrasePair;
  colourMap: Record<number, string | undefined>;
}

const PhrasePairTableRow = ({ phrasePair, colourMap }: RowProps) => {
  const [open, setOpen] = useState(false);
  const classes = useRowStyles();
  return (
    <>
      <TableRow className={classes.root} hover={true}>
        <TableCell key={0}>{phrasePair.base.text}</TableCell>
        <TableCell key={1}>
          <HighlightedPhrase phrase={phrasePair.target} colourMap={colourMap} />
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
              <PhrasePairDetailTable id={phrasePair.id} />
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
  lexemes: Coloured<Lexeme>[];
  annotations: Coloured<Annotation>[];
}

const PhrasePairTable = ({
  phrasePairQuery,
  baseLanguage,
  targetLanguage,
  lexemes,
  annotations,
}: Props) => {
  const annotationColourMap: Record<number, string | undefined> = _(annotations)
    .keyBy("id")
    .mapValues("colour")
    .value();
  const lexemeColourMap: Record<number, string | undefined> = _(lexemes)
    .keyBy("id")
    .mapValues("colour")
    .value();
  const colourMap = { ...annotationColourMap, ...lexemeColourMap };
  const { data: phrasePairs, isSuccess, isFetching } = phrasePairQuery;
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
                <PhrasePairTableRow
                  key={idx}
                  colourMap={colourMap}
                  phrasePair={phrasePair}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : isFetching ? (
        <CircularProgress />
      ) : null}
    </Grid>
  );
};

export default PhrasePairTable;
