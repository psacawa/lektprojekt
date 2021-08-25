import { FormHelperText } from "@material-ui/core";
import React from "react";

const ClientErrorHelper = ({ errors }: { errors?: string[] }) => (
  <>
    {errors &&
      errors.map((error, idx) => (
        <FormHelperText error key={idx}>
          {error}
        </FormHelperText>
      ))}
  </>
);

export default ClientErrorHelper;
