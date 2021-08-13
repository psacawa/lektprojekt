import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import styles from "assets/jss/styles/components/customInputStyle";
// nodejs library that concatenates classes
import clsx from "clsx";
// nodejs library to set properties for components

const useStyles = makeStyles(styles as any);

interface Props {
  labelText?: Node;
  labelProps?: object;
  id?: string;
  inputProps?: any;
  formControlProps?: any;
  inputRootCustomClasses?: string;
  error?: boolean;
  success?: boolean;
  white?: boolean;
  helperText?: Node;
}

export default function CustomInput(props: Props) {
  const classes = useStyles();
  const {
    formControlProps,
    labelText,
    id,
    labelProps,
    inputProps,
    error,
    white,
    // inputRootCustomClasses,
    success,
    helperText,
  } = props;

  const labelClasses = clsx({
    [classes.labelRootError]: error,
    [classes.labelRootSuccess]: success && !error,
  });
  const underlineClasses = clsx({
    [classes.underlineError]: error,
    [classes.underlineSuccess]: success && !error,
    [classes.underline]: true,
    [classes.whiteUnderline]: white,
  });
  // const marginTop = clsx({
  //   [inputRootCustomClasses]: inputRootCustomClasses !== undefined,
  // });
  const inputClasses = clsx({
    [classes.input]: true,
    [classes.whiteInput]: white,
  });
  let formControlClasses;
  if (formControlProps !== undefined) {
    formControlClasses = clsx(formControlProps.className, classes.formControl);
  } else {
    formControlClasses = classes.formControl;
  }
  let helpTextClasses = clsx({
    [classes.labelRootError]: error,
    [classes.labelRootSuccess]: success && !error,
  });
  let newInputProps = {
    maxLength:
      inputProps && inputProps.maxLength ? inputProps.maxLength : undefined,
    minLength:
      inputProps && inputProps.minLength ? inputProps.minLength : undefined,
  };
  return (
    <FormControl {...formControlProps} className={formControlClasses}>
      {labelText !== undefined ? (
        <InputLabel
          className={clsx(classes.labelRoot, labelClasses)}
          htmlFor={id}
          {...labelProps}
        >
          {labelText}
        </InputLabel>
      ) : null}
      <Input
        classes={{
          input: inputClasses,
          // root: marginTop,
          disabled: classes.disabled,
          underline: underlineClasses,
        }}
        id={id}
        {...inputProps}
        inputProps={newInputProps}
      />
      {helperText !== undefined ? (
        <FormHelperText className={helpTextClasses} id={id + "-text"}>
          {helperText}
        </FormHelperText>
      ) : null}
    </FormControl>
  );
}
