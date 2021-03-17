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
  TablePagination,
  TableRow,
} from "@material-ui/core";
import { KeyboardArrowDown, KeyboardArrowUp } from "@material-ui/icons";
import HighlightedPhrase from "components/HighlightedPhrase";
import PhrasePairDetailTable from "components/PhrasePairDetailTable";
import _ from "lodash";
import React, { useState } from "react";
import { QueryObserverResult } from "react-query";

import {
  Coloured,
  Feature,
  Language,
  Lexeme,
  PaginatedApiOutput,
  PhrasePair,
} from "../../types";

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
  phrasePairQuery: QueryObserverResult<PaginatedApiOutput<PhrasePair>>;
  lexemes: Coloured<Lexeme>[];
  features: Coloured<Feature>[];
  onChangePage: (event: any, page: number) => void;
  pageNumber: number;
  rowsPerPage: number;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhrasePairTable = ({
  phrasePairQuery,
  baseLanguage,
  targetLanguage,
  lexemes,
  features,
  onChangePage,
  pageNumber,
  rowsPerPage,
  onChangeRowsPerPage,
}: Props) => {
  const featureColourMap: Record<number, string | undefined> = _(features)
    .keyBy("id")
    .mapValues("colour")
    .value();
  const lexemeColourMap: Record<number, string | undefined> = _(lexemes)
    .keyBy("id")
    .mapValues("colour")
    .value();
  const colourMap = { ...featureColourMap, ...lexemeColourMap };
  const { data, isSuccess, isFetching } = phrasePairQuery;
  return (
    <Grid container justify="center">
      {isSuccess ? (
        <Grid item xs={12}>
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
                {data?.results.map((phrasePair, idx) => (
                  <PhrasePairTableRow
                    key={idx}
                    colourMap={colourMap}
                    phrasePair={phrasePair}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 30, 40, 50]}
            component="div"
            count={data!.count}
            page={pageNumber}
            onChangePage={onChangePage}
            onChangeRowsPerPage={onChangeRowsPerPage}
          />
        </Grid>
      ) : isFetching ? (
        <Grid item>
          <CircularProgress />
        </Grid>
      ) : null}
    </Grid>
  );
};

export default PhrasePairTable;
