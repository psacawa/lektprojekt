import { CircularProgress, Typography } from "@material-ui/core";
import { usePair, useTrainingPlan } from "hooks";
import React, { useState } from "react";
import { useParams } from "react-router-dom";

interface ItemProps {
  list_id: number;
  pair_id: number;
}

const PracticeItem = ({ list_id, pair_id }: ItemProps) => {
  const pairQuery = usePair({ id: pair_id });
  return (
    <>
      {pairQuery.isSuccess ? (
        <>
          <Typography variant="body2">{pairQuery.data!.base.text}</Typography>
          <Typography variant="body2">{pairQuery.data!.target.text}</Typography>
        </>
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

// eventually, the state of the practice should be availabe globally - perhaps redux
const PracticeView = () => {
  const { id } = useParams<{ id: any }>();
  const [pairIds, setPairIds] = useState<number[]>([]);
  const planQuery = useTrainingPlan(
    { list_id: id },
    {
      onSuccess: (data) => {
        setPairIds(data.results.map((pair) => pair.id));
      },
    }
  );
  return (
    <>
      {planQuery.isSuccess ? (
        <>
          <Typography variant="h4">Practice Mode</Typography>
          {planQuery.data!.results.map((pair) => (
            <>
              <Typography variant="body2">{pair.base.text}</Typography>
              <Typography variant="body2">{pair.target.text}</Typography>
            </>
          ))}
        </>
      ) : (
        <>
          <CircularProgress />
        </>
      )}
    </>
  );
};

export default PracticeView;
