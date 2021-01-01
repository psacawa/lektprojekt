import { useParams } from "react-router-dom";
import React from "react";
import PhasePairDetailTable from "../components/PhasePairDetailTable";
import { CircularProgress, Typography } from "@material-ui/core";
import { useQuery } from "react-query";
import * as client from "../client";

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
