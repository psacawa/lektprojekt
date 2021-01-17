import {
  Avatar,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React from "react";
import * as yup from "yup";

import { useCreateAccount } from "../clientHooks";

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .required()
    .matches(
      /[\w-]{4,20}/,
      "Username must consist of letters, numbers, - or _ and have length between 4 and 20."
    ),
  password1: yup
    .string()
    .required()
    .min(8, "The minimum password length is 8."),
  password2: yup
    .string()
    .required()
    .oneOf([yup.ref("password1")], "Passwords don't match."),
  email: yup.string().required().email("Enter a valid email address."),
});

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%",
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const CreateAccountView = () => {
  const classes = useStyles();
  const createAccountMutation = useCreateAccount({
    onSuccess: (data, variables, context) => {
      console.log(data, variables);
    },
  });
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <Formik
          initialValues={{
            username: "",
            email: "",
            password1: "",
            password2: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, bag) => {
            bag.setSubmitting(true);
            await createAccountMutation.mutate(values);
            bag.setSubmitting(false);
          }}
        >
          <Form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  autoComplete="username"
                  name="username"
                  variant="outlined"
                  required
                  fullWidth
                  id="username"
                  label="username"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  variant="outlined"
                  required
                  fullWidth
                  name="password1"
                  label="Password"
                  type="password"
                  id="password1"
                  autoComplete="current-password"
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  component={TextField}
                  variant="outlined"
                  required
                  fullWidth
                  name="password2"
                  label="Confirm Password"
                  type="password"
                  id="password2"
                  autoComplete="current-password"
                />
              </Grid>
              <Grid item xs={12}></Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={classes.submit}
            >
              Sign Up
            </Button>
            <Grid container justify="flex-end">
              <Grid item>
                <Link href="#" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Form>
        </Formik>
      </div>
    </Container>
  );
};
export default CreateAccountView;
