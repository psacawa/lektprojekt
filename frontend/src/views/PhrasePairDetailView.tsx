import { CircularProgress, Typography } from "@material-ui/core";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";

import * as client from "../client";
import PhasePairDetailTable from "../components/PhasePairDetailTable";

interface Props {
  pk: number;
}

const PhrasePairDetailView = () => {
  const { pk } = useParams<any>();
  const phrasePairQuery = useQuery(["pair", pk], () => client.getPair(pk), {});
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
            <PhasePairDetailTable pk={pk} />
          </>
        ) : (
          <CircularProgress />
        )}
      </>
    </>
  );
};

export default PhrasePairDetailView;
