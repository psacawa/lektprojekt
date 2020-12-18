import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import { routes } from "../routes";

const useStyles = makeStyles(() => ({
  list: {
    width: "200px",
  },
}));
const LektDrawer = () => {
  const classes = useStyles();
  return (
    <Drawer variant="permanent">
      <List className={classes.list}>
        {routes.map((route, idx) => (
          <ListItem key={idx}>
            <Link to={route.path}>
              <ListItemText>{route.name}</ListItemText>
            </Link>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default LektDrawer;
