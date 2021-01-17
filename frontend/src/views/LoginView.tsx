import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import axios from "axios";
import { Field, Form, Formik } from "formik";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import React from "react";
import { useDispatch } from "react-redux";
import { Redirect } from "react-router-dom";
import * as yup from "yup";

import { useLogin } from "../clientHooks";
import { login } from "../store/actions";
import { useLoggedIn } from "../store/selectors";

const validationSchema = yup.object().shape({
  email: yup.string().required().label("Email"),
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

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {"Copyright © "}
      <Link color="inherit" href="https://material-ui.com/">
        LektProjekt
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

const LoginView = () => {
  const classes = useStyles();
  const loggedIn = useLoggedIn();
  const dispatch = useDispatch();
  const loginMutation = useLogin({
    onSuccess: (loginSuccessPayload) => {
      axios.defaults.headers[
        "Authorization"
      ] = `Token ${loginSuccessPayload.key}`;
      dispatch(login(loginSuccessPayload));
    },
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
                {/*
                 * <Field
                 *   component{CheckboxWithLabel}
                 *   control={<Checkbox value="remember" color="primary" />}
                 *   label="Remember me"
                 * />
                 */}
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
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="#" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            </Formik>
          </div>
          <Box mt={8}>
            <Copyright />
          </Box>
        </Container>
      ) : (
        <Redirect to="/" />
      )}
    </>
  );
};
export default LoginView;
