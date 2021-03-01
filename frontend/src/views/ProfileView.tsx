import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import React, { useState } from "react";

import { useSubs } from "../clientHooks";
import TrackedListDisplay from "../components/TrackedListDisplay";
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
            <TrackedListDisplay list={list} />
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
  const subscription: Subscription | undefined =
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
            <TrackedListAccordion lists={subscription?.lists} />
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
