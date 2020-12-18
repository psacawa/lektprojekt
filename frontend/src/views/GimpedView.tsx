import { Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import * as client from "../client";
import { Language } from "../types";

const GimpedView = () => {
  const [languages, setLanguages] = useState<Language[]>([]);
  return (
    <>
      <Typography variant="h5">Welcome to Gimped Mode</Typography>
    </>
  );
};

export default GimpedView;
