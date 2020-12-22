import { useParams } from "react-router-dom";

const PhrasePairDetailView = () => {
  const { pk: pkString } = useParams<{ pk: string }>();
  const pk = parseInt(pkString);
  return <>hello</>;
  // TODO 22/12/20 psacawa: finish this
};

export default PhrasePairDetailView;
