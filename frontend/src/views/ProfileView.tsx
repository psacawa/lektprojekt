import {
  CircularProgress,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { Add, Clear } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import flags from "assets/img/flags";
import styles from "assets/jss/styles/components/buttonStyle";
import { Button } from "components/CustomButtons";
import { CustomTabs } from "components/CustomTabs";
import { GridContainer, GridItem } from "components/Grid";
import { Table } from "components/Table";
import { useAuth } from "hooks/auth";
import { useSession } from "hooks/session";
import { find } from "lodash";
import React, { useState } from "react";
import SweetAlert from "react-bootstrap-sweetalert";
import { useQueryClient } from "react-query";
import { Link, useHistory } from "react-router-dom";
import { Language, LanguageCourse } from "types";

import {
  useCourses,
  useCreateCourse,
  useCreateTrackedList,
  useDeleteCourse,
  useDeleteTrackedList,
  useLanguages,
} from "../hooks";

const useStyles = makeStyles(styles);

const NewCourseForm = () => {
  const languageQuery = useLanguages();
  const queryClient = useQueryClient();
  const [value, setValue] = useState<Language | null>(null);
  const createCourse = useCreateCourse({
    onSuccess: (data, variables) => {
      queryClient.refetchQueries(["courses"]);
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
                onClick={async () => {
                  let enLang = find(languageQuery.data!, {
                    lid: "en",
                  }) as Language;
                  await createCourse.mutateAsync({
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
  const history = useHistory();
  const { session, setSession } = useSession();
  const [activeTab, setActiveTab] = useState(0);
  const queryClient = useQueryClient();
  const courseQuery = useCourses();
  const { user } = useAuth();
  const deleteCourse = useDeleteCourse({
    onSuccess: (data, variables) => {
      queryClient.refetchQueries(["courses"]);
    },
  });
  const course: LanguageCourse<true> | undefined =
    courseQuery.data?.results[activeTab];
  const [listNameInputValue, setListNameInputValue] = useState("");
  const [createNewListOpen, setCreateNewListOpen] = useState(false);
  const createListMutation = useCreateTrackedList({
    onSuccess: (data, variables) => {
      setSession({ currentTrackedList: data.id });
    },
  });
  const deleteListMutation = useDeleteTrackedList();
  const [addingNewCourse, setAddingNewCourse] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const courseTabs:
    | {
        tabName: string;
        tabIcon?: any;
        tabContent: React.ReactNode;
      }[]
    | undefined = courseQuery.isSuccess
    ? courseQuery.data.results
        .map((course, idx) => ({
          tabName: course.target_lang.name,
          tabIcon: <img src={flags[course.target_voice.aid.slice(3)]} />,
          tabContent: (
            <>
              <Table
                tableData={course.lists.map((list, idx) => [
                  list.name,
                  <Button
                    size="sm"
                    component={Link}
                    to={`/lists/${list.id}/`}
                    variant="outlined"
                  >
                    Add Items
                  </Button>,
                  <Button
                    size="sm"
                    // component={Link}
                    // to={`/lists/${list.id}/practice/`}
                    onClick={(ev: React.MouseEvent) => {
                      history.push(`/lists/${list.id}/practice/`);
                    }}
                    variant="outlined"
                  >
                    Go!
                  </Button>,

                  <IconButton
                    onClick={async (ev: React.MouseEvent<{}>) => {
                      if (list.id === session.currentTrackedList) {
                        setSession({ currentTrackedList: undefined });
                      }
                      await deleteListMutation.mutateAsync({
                        list_id: list.id,
                      });
                      await queryClient.refetchQueries(["courses"]);
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
                  style={{ marginLeft: "20px" }}
                  onClick={async (ev: React.MouseEvent<{}>) => {
                    await createListMutation.mutateAsync({
                      course: course.id,
                      name: listNameInputValue,
                    });
                    setListNameInputValue("");
                    queryClient.refetchQueries(["courses"]);
                  }}
                >
                  Create
                </Button>
              </div>
              <Button
                color="danger"
                onClick={(ev: React.MouseEvent<{}>) => {
                  setDeleteCourseModalOpen(true);
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
              {deleteCourseModalOpen && (
                <SweetAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Are you sure?"
                  onConfirm={async () => {
                    await deleteCourse.mutateAsync({ course_id: course.id });
                    setDeleteCourseModalOpen(false);
                    queryClient.refetchQueries(["couses"]);
                  }}
                  onCancel={() => {
                    setDeleteCourseModalOpen(false);
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
            tabContent: <NewCourseForm />,
          },
        ])
    : undefined;

  return (
    <>
      {courseQuery.isSuccess && courseTabs !== undefined ? (
        <GridContainer>
          <GridItem xs={12}>
            <CustomTabs
              value={activeTab}
              changeValue={(ev, newValue: number) => {
                setActiveTab(newValue);
                const courses = courseQuery.data.results;
                if (newValue in courses) {
                  console.log(`new value: ${newValue}`);
                  setSession({
                    currentCourse: courses[newValue].id,
                  });
                }
              }}
              title="Languages"
              headerColor="primary"
              tabs={courseTabs}
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
