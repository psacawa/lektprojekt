import { CircularProgress, Typography } from "@material-ui/core";
import PhrasePairDetailTable from "components/PhrasePairDetailTable";
import { usePair } from "hooks";
import { useParams } from "react-router-dom";

const PhrasePairDetailView = () => {
  const { id } = useParams<any>();
  const phrasePairQuery = usePair({ id });
  return (
    <>
      <>
        {phrasePairQuery.isSuccess ? (
          <>
            <Typography variant="h6">
              {phrasePairQuery.data.target.text}
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
