import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/footerStyle";
import cx from "classnames";
import { Link } from "react-router-dom";

const useStyles = makeStyles(styles);

interface Props {
  fluid?: boolean;
  white?: boolean;
}

export default function Footer({ fluid, white }: Props) {
  const classes = useStyles();
  let container = cx({
    [classes.container]: !fluid,
    [classes.containerFluid]: fluid,
    [classes.whiteColor]: white,
  });
  let anchor =
    classes.a +
    cx({
      [" " + classes.whiteColor]: white,
    });
  return (
    <footer className={classes.footer}>
      <div className={container}>
        <div className={classes.left}>
          <List className={classes.list}>
            <ListItem className={classes.inlineBlock}>
              <Link to="/" className={classes.inlineBlock}>
                Home
              </Link>
            </ListItem>{" "}
            <ListItem className={classes.inlineBlock}>
              <Link to="/about/" className={classes.inlineBlock}>
                About
              </Link>
            </ListItem>
            <ListItem className={classes.inlineBlock}>
              <Link to="/pricing/" className={classes.inlineBlock}>
                Pricing
              </Link>
            </ListItem>
          </List>
        </div>
        <p className={classes.right}>
          &copy; {new Date().getFullYear()}{" "}
          <a href="/" className={anchor} target="_blank">
            {process.env.REACT_NAME}
          </a>
        </p>
      </div>
    </footer>
  );
}

const IconAttribution = () => (
  <div>
    Icons made by{" "}
    <a href="https://www.freepik.com" title="Freepik">
      Freepik
    </a>{" "}
    from{" "}
    <a href="https://www.flaticon.com/" title="Flaticon">
      www.flaticon.com
    </a>
  </div>
);
