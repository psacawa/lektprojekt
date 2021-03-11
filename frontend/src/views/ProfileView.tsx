import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  List,
  ListItem,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { Add, ExpandMore } from "@material-ui/icons";
import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";

import TrackedListView from "../components/TrackedListView";
import { useCreateTrackedList, useSubs } from "../hooks";
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
  const queryClient = useQueryClient();
  const subscriptionQuery = useSubs();
  const subscription: Subscription<true> | undefined =
    subscriptionQuery.data?.results[activeTab];
  const [listNameInputValue, setListNameInputValue] = useState("");
  const [createNewListOpen, setCreateNewListOpen] = useState(false);
  const createListMutation = useCreateTrackedList();
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
                <ListItem>
                  <TextField id="name" name="name" label="Name" />
                  <IconButton
                    onClick={(ev: React.MouseEvent<{}>) => {
                      createListMutation.mutate({
                        subscription: subscription.id,
                        name: listNameInputValue,
                      });
                    }}
                  >
                    <Add />
                  </IconButton>
                </ListItem>
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
