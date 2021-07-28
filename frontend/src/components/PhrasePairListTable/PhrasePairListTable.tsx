import {
  Box,
  CircularProgress,
  Collapse,
  Grid,
  Hidden,
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
  Paginate,
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
  phrasePairQuery: QueryObserverResult<Paginate<PhrasePair>>;
  lexemes: Coloured<Lexeme>[];
  features: Coloured<Feature>[];
  onPageChange: (event: any, page: number) => void;
  pageNumber: number;
  rowsPerPage: number;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// TODO 17/03/20 psacawa: figure out how to present the PhrasePairTable on xs
// https://stackoverflow.com/questions/42785964/is-it-possible-to-display-table-rows-vertically-with-css
// https://stackoverflow.com/questions/19723617/responsive-tables-the-smart-way
const useStyles = makeStyles((theme) => ({
  [theme.breakpoints.down("sm")]: {
    "*": {
      backgroundColor: "blue",
    },
  },
}));

const PhrasePairTable = ({
  phrasePairQuery,
  baseLanguage,
  targetLanguage,
  lexemes,
  features,
  onPageChange,
  pageNumber,
  rowsPerPage,
  onRowsPerPageChange,
}: Props) => {
  const classes = useStyles();
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
    <>
      {isSuccess ? (
        <>
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
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
      ) : isFetching ? (
        <Grid item>
          <CircularProgress />
        </Grid>
      ) : null}
    </>
  );
};

export default PhrasePairTable;
