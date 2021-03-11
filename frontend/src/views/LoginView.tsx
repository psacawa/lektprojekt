import {
  Avatar,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link as MuiLink,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import React, { useState } from "react";
import { Link, Redirect, useHistory } from "react-router-dom";
import * as yup from "yup";

import ClientErrorHelper from "../components/ClientErrorHelper";
import { useAuth } from "../hooks/auth";
import { LoginServerErrors, LoginValues } from "../types";

const validationSchema: yup.SchemaOf<LoginValues> = yup.object().shape({
  email: yup
    .string()
    .label("Email")
    .required()
    .email("Enter a valid email address."),
  password: yup.string().required().label("Password"),
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
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const LoginView = () => {
  const classes = useStyles();
  const history = useHistory();
  const [clientErrors, setClientErrors] = useState<LoginServerErrors>({});
  const { user, login } = useAuth();
  return (
    <>
      {!user ? (
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlined />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign in
            </Typography>
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, bag) => {
                bag.setSubmitting(true);
                await login.mutateAsync(values, {
                  onError: (error) => {
                    setClientErrors(error);
                    bag.setSubmitting(false);
                  },
                  onSuccess: () => {
                    history.push("/");
                  },
                });
              }}
            >
              <Form>
                <Field
                  component={TextField}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <ClientErrorHelper errors={clientErrors.email} />
                <Field
                  component={TextField}
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <ClientErrorHelper errors={clientErrors.password} />
                {/*
                    TODO 10/03/20 psacawa: add "remember me" as an option
                 * <Field
                 *   component{CheckboxWithLabel}
                 *   control={<Checkbox value="remember" color="primary" />}
                 *   label="Remember me"
                 * />
                 */}
                <ClientErrorHelper errors={clientErrors.non_field_errors} />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  className={classes.submit}
                >
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <MuiLink
                      component={Link}
                      to="/reset-password"
                      variant="body2"
                    >
                      Forgot password?
                    </MuiLink>
                  </Grid>
                  <Grid item>
                    <MuiLink
                      component={Link}
                      to="/create-account"
                      variant="body2"
                    >
                      {"Don't have an account? Sign Up"}
                    </MuiLink>
                  </Grid>
                </Grid>
              </Form>
            </Formik>
          </div>
        </Container>
      ) : (
        <Redirect to="/" />
      )}
    </>
  );
};
export default LoginView;
