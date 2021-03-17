import {
  Avatar,
  Button,
  Container,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Grid,
  Link as MuiLink,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import ClientErrorHelper from "components/ClientErrorHelper";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import { useAuth } from "hooks/auth";
import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { CreateAccountServerErrors, CreateAccountValues } from "types";
import * as yup from "yup";

const validationSchema: yup.SchemaOf<CreateAccountValues> = yup.object().shape({
  username: yup
    .string()
    .label("Username")
    .required()
    .matches(
      /[\w-]{4,20}/,
      "Username must consist of letters, numbers, - or _ and have length between 4 and 20."
    ),
  email: yup
    .string()
    .label("Email")
    .required()
    .email("Enter a valid email address."),
  password1: yup
    .string()
    .label("Password")
    .required()
    .min(8, "The minimum password length is 8."),
  password2: yup
    .string()
    .label("Password Repeat")
    .required()
    .oneOf([yup.ref("password1")], "Passwords don't match."),
});

const SuccessDialog = ({ open }: { open: boolean }) => {
  const history = useHistory();
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Confirmation Email Sent</DialogTitle>
        <DialogContentText>
          A confirmation email has been sent and should arrive within five
          minutes. It contains a link to confirm your email address.{" "}
        </DialogContentText>
        <DialogActions>
          <Button
            onClick={() => {
              history.push("/login");
            }}
            color="primary"
          >
            Goto Login Page
          </Button>
          <Button
            onClick={(event) => {
              history.push("/");
            }}
            autoFocus
            color="primary"
          >
            Continue
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

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
  const { createAccount } = useAuth();
  const classes = useStyles();
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [clientErrors, setClientErrors] = useState<CreateAccountServerErrors>(
    {}
  );
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
            await createAccount.mutateAsync(values, {
              onSuccess: () => {
                setSuccessDialogOpen(true);
              },
              onError: (data: CreateAccountServerErrors) => {
                setClientErrors(data);
              },
            });
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
                  label="Username"
                  autoFocus
                />
                <ClientErrorHelper errors={clientErrors.username} />
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
                <ClientErrorHelper errors={clientErrors.email} />
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
                <ClientErrorHelper errors={clientErrors.password1} />
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
                <ClientErrorHelper errors={clientErrors.password2} />
              </Grid>
              <ClientErrorHelper errors={clientErrors.non_field_errors} />
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
                <MuiLink component={Link} to="/login" variant="body2">
                  Already have an account? Sign in
                </MuiLink>
              </Grid>
            </Grid>
          </Form>
        </Formik>
      </div>
      <SuccessDialog open={successDialogOpen} />
    </Container>
  );
};
export default CreateAccountView;
