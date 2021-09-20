import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/footerStyle";
import clsx from "clsx";
import { Link } from "react-router-dom";

const useStyles = makeStyles(styles);

interface Props {
  fluid?: boolean;
  white?: boolean;
}

interface FooterItem {
  text: string;
  path: string;
}

let footerLinks: FooterItem[] = [
  {
    path: "/",
    text: "Home",
  },
  {
    path: "/about/",
    text: "About",
  },
  { path: "/pricing/", text: "Pricing" },
  {
    path: "/policies/#tos",
    text: "Terms of Service",
  },
  {
    path: "/policies/#privacy",
    text: "Privacy Policy",
  },
];

if (process.env.NODE_ENV === "development") {
  footerLinks = footerLinks.concat([
    {
      path: "/throw-error",
      text: "Throw Error",
    },
    {
      path: "/scratch",
      text: "Scratchpad",
    },
  ]);
}

export default function Footer({ fluid, white }: Props) {
  const classes = useStyles();
  let container = clsx({
    [classes.container]: !fluid,
    [classes.containerFluid]: fluid,
    [classes.whiteColor]: white,
  });
  let anchor = clsx(classes.a, {
    [classes.whiteColor]: white,
  });
  return (
    <footer className={classes.footer}>
      <div className={container}>
        <div className={classes.left}>
          <List className={classes.list}>
            {footerLinks.map((link, idx) => (
              <ListItem className={classes.inlineBlock} key={idx}>
                <Link className={classes.block} to={link.path}>
                  {link.text}
                </Link>
              </ListItem>
            ))}
          </List>
        </div>
        <p className={classes.right}>
          &copy; {new Date().getFullYear()}{" "}
          <a className={anchor} href="/" target="_blank">
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
