import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { Add, ExpandMore, Home } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { find } from "lodash";
import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";

import flags from "../assets/img/flags";
import { Button } from "../components/CustomButtons";
import { CustomTabs } from "../components/CustomTabs";
import { GridContainer, GridItem } from "../components/Grid";
import TrackedListView from "../components/TrackedListView";
import {
  useCreateSubscription,
  useCreateTrackedList,
  useLanguages,
  useSubs,
} from "../hooks";
import { Language, Subscription, TrackedList } from "../types";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
});

const NewSubscriptionForm = () => {
  const languageQuery = useLanguages();
  const queryClient = useQueryClient();
  const [value, setValue] = useState<Language | null>(null);
  const createSubscription = useCreateSubscription({
    onSuccess: (data, variables) => {
      queryClient.refetchQueries(["subs"]);
    },
  });
  return (
    <>
      {languageQuery.isSuccess ? (
        <>
          <Autocomplete
            value={value}
            onChange={(ev: React.ChangeEvent<{}>, newValue) => {
              setValue(newValue);
            }}
            options={languageQuery.data!}
            getOptionLabel={(lang) => lang.name}
            renderInput={(params) => (
              <TextField {...params} label="Language" variant="outlined" />
            )}
          />
          {value && (
            <Button
              onClick={() => {
                let enLang = find(languageQuery.data!, {
                  lid: "en",
                }) as Language;
                createSubscription.mutate({
                  base_lang: enLang.id,
                  base_voice: enLang.default_voice.id,
                  target_lang: value.id,
                  target_voice: value.default_voice.id,
                });
              }}
            >
              Create
            </Button>
          )}
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

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
  const [addingNewSubscription, setAddingNewSubscription] = useState(false);
  const subscriptionTabs:
    | {
        tabName: string;
        tabIcon?: any;
        tabContent: React.ReactNode;
      }[]
    | undefined = subscriptionQuery.isSuccess
    ? subscriptionQuery
        .data!.results.map((sub, idx) => ({
          tabName: sub.target_lang.name,
          tabIcon: <img src={flags[sub.target_voice.aid.slice(3)]} />,
          tabContent: (
            <List>
              {sub.lists.map((list, idx) => (
                <ListItem key={idx}>
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
                      subscription: sub.id,
                      name: listNameInputValue,
                    });
                  }}
                >
                  <Add />
                </IconButton>
              </ListItem>
            </List>
          ),
        }))
        .concat([
          {
            tabName: "Add New Language",
            tabIcon: <Add />,
            tabContent: <NewSubscriptionForm />,
          },
        ])
    : undefined;
  return (
    <>
      {subscriptionQuery.isSuccess && subscriptionTabs !== undefined ? (
        <GridContainer>
          <GridItem xs={12}>
            <CustomTabs
              value={activeTab}
              changeValue={(ev, newValue) => {
                setActiveTab(newValue);
              }}
              title="Languages"
              headerColor="primary"
              tabs={subscriptionTabs}
            />
          </GridItem>
        </GridContainer>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default ProfileView;
