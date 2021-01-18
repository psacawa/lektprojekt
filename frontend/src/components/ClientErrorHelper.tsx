import { FormHelperText } from "@material-ui/core";

const ClientErrorHelper = ({ errors }: { errors?: string[] }) => (
  <>
    {errors &&
      errors.map((error, idx) => (
        <FormHelperText key={idx} error>
          {error}
        </FormHelperText>
      ))}
  </>
);

export default ClientErrorHelper;
