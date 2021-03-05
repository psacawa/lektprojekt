import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Divider,
  Grid,
  Link as MuiLink,
  List,
  ListItem,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";
import { Link } from "react-router-dom";

import TrackedListView from "../components/TrackedListView";
import { useSubs } from "../hooks";
import { Subscription, TrackedList } from "../types";

function TrackedListAccordion({ lists }: { lists: TrackedList[] }) {
  const [expandedList, setExpandedList] = useState<number | null>(null);
  return (
    <>
      {lists.map((list, idx) => (
        <Accordion
          expanded={expandedList === idx}
          onChange={(event: React.ChangeEvent<{}>, isExpanded: boolean) => {
            setExpandedList(isExpanded ? idx : null);
          }}
        >
          <AccordionSummary>
            <Typography>{list.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {/* <TrackedListView list={list} /> */}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const ProfileView = () => {
  const classes = useStyles();
  const [activeTab, setActiveTab] = useState(0);
  const subscriptionQuery = useSubs();
  const subscription: Subscription<true> | undefined =
    subscriptionQuery.data?.results[activeTab];
  return (
    <Paper className={classes.root}>
      {subscriptionQuery.isSuccess ? (
        <>
          <Tabs
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
          >
            {subscriptionQuery.data.results.map((sub, idx) => (
              <Tab key={idx} label={sub.target_lang.name} />
            ))}
          </Tabs>
          {subscription ? (
            <>
              <List>
                {subscription.lists.map((list, idx) => (
                  <ListItem>
                    <MuiLink component={Link} to={`/lists/${list.id}/`}>
                      {list.name}
                    </MuiLink>
                  </ListItem>
                ))}
              </List>
              <Divider />
              <Typography variant="h5">Language Config</Typography>
              <Typography variant="body1">placeholder</Typography>
            </>
          ) : null}
        </>
      ) : (
        <>
          <CircularProgress />
        </>
      )}
    </Paper>
  );
};

export default ProfileView;
