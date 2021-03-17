import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import styles from "assets/jss/styles/components/tableStyle";
import cx from "classnames";
import React from "react";

const useStyles = makeStyles(styles);

interface Props {
  tableHeaderColor?:
    | "warning"
    | "primary"
    | "danger"
    | "success"
    | "info"
    | "rose"
    | "gray";
  tableHead?: string[];
  // Of(arrayOf(React.ReactNode)) || Of(object),
  tableData: any[];
  hover?: boolean;
  coloredColls?: number[];
  // Of(["warning","primary","danger","success","info","rose","gray"]) - colorsColls
  colorsColls?: [];
  customCellClasses?: string[];
  customClassesForCells?: number[];
  customHeadCellClasses?: string[];
  customHeadClassesForCells?: number[];
  striped?: boolean;
  // this will cause some changes in font
}

export default function CustomTable(props: Props) {
  const classes = useStyles();
  const {
    coloredColls = [],
    colorsColls = [],
    customCellClasses = [],
    customClassesForCells = [],
    customHeadCellClasses = [],
    customHeadClassesForCells = [],
    hover = false,
    striped = false,
    tableData,
    tableHead,
    tableHeaderColor = "gray",
  } = props;
  return (
    <div className={classes.tableResponsive}>
      <Table className={classes.table}>
        {tableHead !== undefined ? (
          <TableHead className={classes[tableHeaderColor]}>
            <TableRow className={classes.tableRow + " " + classes.tableRowHead}>
              {tableHead.map((prop, key) => {
                const tableCellClasses =
                  classes.tableHeadCell +
                  " " +
                  classes.tableCell +
                  " " +
                  cx({
                    [customHeadCellClasses[
                      customHeadClassesForCells.indexOf(key)
                    ]]: customHeadClassesForCells.indexOf(key) !== -1,
                  });
                return (
                  <TableCell className={tableCellClasses} key={key}>
                    {prop}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
        ) : null}
        <TableBody>
          {tableData.map((row, key) => {
            var rowColor = "";
            var rowColored = false;
            if (row.color !== undefined) {
              rowColor = row.color;
              rowColored = true;
              row = row.data;
            }
            const tableRowClasses = cx({
              [classes.tableRowBody]: true,
              [classes.tableRowHover]: hover,
              [classes[(rowColor + "Row") as keyof typeof classes]]: rowColored,
              [classes.tableStripedRow]: striped && key % 2 === 0,
            });
            return (
              <TableRow
                key={key}
                hover={hover}
                className={classes.tableRow + " " + tableRowClasses}
              >
                {row.map((cell: any, key: number) => {
                  const tableCellClasses =
                    classes.tableCell +
                    " " +
                    cx({
                      [classes[colorsColls[coloredColls.indexOf(key)]]]:
                        coloredColls.indexOf(key) !== -1,
                      [customCellClasses[customClassesForCells.indexOf(key)]]:
                        customClassesForCells.indexOf(key) !== -1,
                    });
                  return (
                    <TableCell className={tableCellClasses} key={key}>
                      {cell}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

CustomTable.defaultProps = {};
