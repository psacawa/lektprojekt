import { CircularProgress, Typography } from "@material-ui/core";
import React from "react";
import { useParams } from "react-router-dom";

import { usePair } from "../clientHooks";
import PhrasePairDetailTable from "../components/PhrasePairDetailTable";

const PhrasePairDetailView = () => {
  const { id } = useParams<any>();
  const phrasePairQuery = usePair({ id });
  return (
    <>
      <>
        {phrasePairQuery.isSuccess ? (
          <>
            <Typography variant="h6">
              {phrasePairQuery.data.target!.text}
            </Typography>
            <Typography variant="caption">
              {phrasePairQuery.data.base!.text}
            </Typography>
            <PhrasePairDetailTable id={id} />
          </>
        ) : (
          <CircularProgress />
        )}
      </>
    </>
  );
};

export default PhrasePairDetailView;
