import { makeStyles } from "@material-ui/core/styles";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import classNames from "classnames";
import React from "react";

import styles from "../../assets/jss/styles/components/customTabsStyle";
import { Card, CardBody, CardHeader } from "../../components/Card";

const useStyles = makeStyles(styles);

interface Tab {
  tabName: string;
  tabIcon?: any;
  tabContent: React.ReactNode;
}

interface Props {
  // the default opened tab - index starts at 0
  value: number;
  // function for changing the value
  // note, if you pass this function,
  // the default function that changes the tabs will no longer work,
  // so you need to create the changing functionality as well
  changeValue: (ev: React.ChangeEvent<{}>, value: any) => void;
  headerColor: "warning" | "success" | "danger" | "info" | "primary" | "rose";
  title: string;
  tabs?: Tab[];
  additionalTab?: Tab;
  plainTabs?: boolean;
}

export default function CustomTabs(props: Props) {
  const classes = useStyles();
  const { headerColor, plainTabs, tabs, title } = props;
  const cardTitle = classNames({
    [classes.cardTitle]: true,
  });
  return (
    <Card plain={plainTabs}>
      <CardHeader color={headerColor} plain={plainTabs}>
        {title !== undefined ? <div className={cardTitle}>{title}</div> : null}
        <Tabs
          value={props.value}
          onChange={props.changeValue}
          classes={{
            root: classes.tabsRoot,
            indicator: classes.displayNone,
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs?.map((tab, idx) => {
            let icon = {};
            if ("tabIcon" in tab) {
              icon = {
                icon: tab.tabIcon,
              };
            }
            return (
              <Tab
                classes={{
                  root: classes.tabRootButton,
                  selected: classes.tabSelected,
                  wrapper: classes.tabWrapper,
                }}
                key={idx}
                label={tab.tabName}
                {...icon}
              />
            );
          })}
        </Tabs>
      </CardHeader>
      <CardBody>
        {tabs?.map((tab, idx) => {
          if (idx === props.value) {
            return <div key={idx}>{tab.tabContent}</div>;
          }
          return null;
        })}
      </CardBody>
    </Card>
  );
}
