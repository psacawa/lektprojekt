import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link as MuiLink,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { flatten } from "lodash";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import * as yup from "yup";

import { useLogin } from "../clientHooks";
import ClientErrorHelper from "../components/ClientErrorHelper";
import { login } from "../store/actions";
import { useLoggedIn } from "../store/selectors";
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
  const loggedIn = useLoggedIn();
  const [clientErrors, setClientErrors] = useState<LoginServerErrors>({});
  const dispatch = useDispatch();
  const loginMutation = useLogin({
    onSuccess: (loginSuccessPayload) => {
      axios.defaults.headers[
        "Authorization"
      ] = `Token ${loginSuccessPayload.key}`;
      dispatch(login(loginSuccessPayload));
    },
    onError: (data, variables) => setClientErrors(data),
  });

  return (
    <>
      {!loggedIn ? (
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
                await loginMutation.mutate(values);
                setTimeout(() => bag.setSubmitting(false), 1000);
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
                      to="/recover-password"
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
