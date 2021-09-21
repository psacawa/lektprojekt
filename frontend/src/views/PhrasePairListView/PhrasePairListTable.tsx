import {
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
import { getLogger } from "utils";
import { useSearchContext } from "views/PhrasePairListView/SearchContext";

import { Paginate, PhrasePair } from "../../types";

const logger = getLogger("PhrasePairListTable");

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
          <HighlightedPhrase colourMap={colourMap} phrase={phrasePair.target} />
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
            <PhrasePairDetailTable id={phrasePair.id} />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

interface Props {
  phrasePairQuery: QueryObserverResult<Paginate<PhrasePair>>;
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

const PhrasePairTable = ({ phrasePairQuery }: Props) => {
  const {
    setPageNumber,
    setRowsPerPage,
    baseLanguage,
    targetLanguage,
    lexemes,
    features,
    pageNumber,
    rowsPerPage,
  } = useSearchContext();
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
                  <TableCell align="left" key={0}>
                    {baseLanguage?.name}
                  </TableCell>
                  <TableCell align="left" key={1}>
                    {targetLanguage?.name}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.results.map((phrasePair, idx) => (
                  <PhrasePairTableRow
                    colourMap={colourMap}
                    key={idx}
                    phrasePair={phrasePair}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data!.count}
            onPageChange={(
              event: React.MouseEvent<{}> | null,
              page: number
            ) => {
              setPageNumber(page);
            }}
            onRowsPerPageChange={(
              event: React.ChangeEvent<HTMLInputElement>
            ) => {
              setRowsPerPage(parseInt(event.target.value, 10));
            }}
            page={pageNumber}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[10, 20, 30, 40, 50]}
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
