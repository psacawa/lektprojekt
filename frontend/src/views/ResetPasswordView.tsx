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
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import { TextField } from "formik-material-ui";
import { useResetPassword } from "hooks/auth";
import { useState } from "react";
import * as yup from "yup";

const SuccessDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<boolean>;
}) => {
  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>Password Reset Email Sent</DialogTitle>
        <DialogContentText>
          An email containing a link to reset your password has been sent and
          should arrive within five minutes.
        </DialogContentText>
        <DialogActions>
          <Button
            autoFocus
            color="primary"
            onClick={(event) => {
              setOpen(false);
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const validationSchema: yup.SchemaOf<{ email: string }> = yup.object().shape({
  email: yup
    .string()
    .label("Email")
    .required()
    .email("Enter a valid email address."),
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

const ResetPasswordView = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const resetPasswordMutation = useResetPassword({
    onSuccess: (data, variables) => {
      setSuccessDialogOpen(true);
    },
    onError: (error, variables) => {
      // TODO 19/01/20 psacawa: report error state
      return;
    },
  });
  const classes = useStyles();
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Send Recovery Email
        </Typography>
        <Formik
          initialValues={{
            email: "",
          }}
          onSubmit={async (values, bag) => {
            bag.setSubmitting(true);
            await resetPasswordMutation.mutate(values);
            bag.setSubmitting(false);
          }}
          validationSchema={validationSchema}
        >
          <Form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Field
                  autoComplete="email"
                  component={TextField}
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  required
                  variant="outlined"
                />
              </Grid>
              <Button
                className={classes.submit}
                fullWidth
                type="submit"
                variant="contained"
              >
                Send Password Reset Email
              </Button>
            </Grid>
          </Form>
        </Formik>
      </div>
      <SuccessDialog open={successDialogOpen} setOpen={setSuccessDialogOpen} />
    </Container>
  );
};

export default ResetPasswordView;
