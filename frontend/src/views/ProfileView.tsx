import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Link as TableCell,
  List,
  ListItem,
  ListItemSecondaryAction,
  makeStyles,
  Paper,
  Tab,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import { Add, Clear, ExpandMore, Home } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import flags from "assets/img/flags";
import styles from "assets/jss/styles/components/buttonStyle";
import { Button } from "components/CustomButtons";
import { CustomTabs } from "components/CustomTabs";
import { GridContainer, GridItem } from "components/Grid";
import { Table } from "components/Table";
import TrackedListView from "components/TrackedListView";
import { useAuth } from "hooks/auth";
import { find } from "lodash";
import React, { useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { Language, Subscription, TrackedList } from "types";

import {
  useCreateSubscription,
  useCreateTrackedList,
  useDeleteSubscription,
  useDeleteTrackedList,
  useLanguages,
  useSubs,
} from "../hooks";

const useStyles = makeStyles(styles);

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
            <>
              <Button
                onClick={() => {
                  let enLang = find(languageQuery.data!, {
                    lid: "en",
                  }) as Language;
                  createSubscription.mutate({
                    base_lang: enLang.id,
                    base_voice: enLang.default_voice,
                    target_lang: value.id,
                    target_voice: value.default_voice,
                  });
                }}
              >
                Add
              </Button>
            </>
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
  const { user } = useAuth();
  const deleteSubscription = useDeleteSubscription({
    onSuccess: (data, variables) => {
      queryClient.refetchQueries(["subs"]);
    },
  });
  const subscription: Subscription<true> | undefined =
    subscriptionQuery.data?.results[activeTab];
  const [listNameInputValue, setListNameInputValue] = useState("");
  const [createNewListOpen, setCreateNewListOpen] = useState(false);
  const createListMutation = useCreateTrackedList();
  const deleteListMutation = useDeleteTrackedList();
  const [addingNewSubscription, setAddingNewSubscription] = useState(false);
  const [
    deleteSubscriptionModalOpen,
    setDeleteSubscriptionModalOpen,
  ] = useState(false);
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
            <>
              <Table
                // tableHead={["name", "name", "name"]}
                tableData={sub.lists.map((list, idx) => [
                  list.name,
                  <Button
                    size="sm"
                    component={Link}
                    to={`/lists/${list.id}/`}
                    variant="outlined"
                  >
                    Edit
                  </Button>,
                  <Button
                    size="sm"
                    component={Link}
                    to={`/lists/${list.id}/practice/`}
                    variant="outlined"
                  >
                    Practice
                  </Button>,

                  <IconButton
                    onClick={async (ev: React.MouseEvent<{}>) => {
                      await deleteListMutation.mutateAsync({
                        list_pk: list.id,
                      });
                      await queryClient.refetchQueries(["subs"]);
                    }}
                  >
                    <Clear />
                  </IconButton>,
                ])}
              ></Table>
              <div>
                <TextField
                  value={listNameInputValue}
                  onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                    setListNameInputValue(ev.currentTarget.value);
                  }}
                  id="name"
                  name="name"
                  label="Add a new list"
                />
                <Button
                  onClick={async (ev: React.MouseEvent<{}>) => {
                    await createListMutation.mutateAsync({
                      subscription: sub.id,
                      name: listNameInputValue,
                    });
                    setListNameInputValue("");
                    queryClient.refetchQueries(["subs"]);
                  }}
                >
                  Create
                </Button>
              </div>
              <Button
                color="danger"
                onClick={(ev: React.MouseEvent<{}>) => {
                  setDeleteSubscriptionModalOpen(true);
                }}
              >
                Delete all lists
              </Button>
              {!user && (
                <p>
                  Data for users without an account is deleted after 24 hours,
                  make an account to persist it.
                </p>
              )}
              {deleteSubscriptionModalOpen && (
                <SweetAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Are you sure?"
                  onConfirm={async () => {
                    await deleteSubscription.mutateAsync({ sub_id: sub.id });
                    setDeleteSubscriptionModalOpen(false);
                    queryClient.refetchQueries(["subs"]);
                  }}
                  onCancel={() => {
                    setDeleteSubscriptionModalOpen(false);
                  }}
                  confirmBtnCssClass={classes.button + " " + classes.success}
                  cancelBtnCssClass={classes.button + " " + classes.danger}
                  confirmBtnText="Confirm"
                  cancelBtnText="Cancel"
                  showCancel
                >
                  Really delete all training lists for this language?
                </SweetAlert>
              )}
            </>
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
