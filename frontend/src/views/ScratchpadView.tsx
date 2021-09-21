import { useReducer } from "react";
import { getLogger } from "utils";

const logger = getLogger("ScratchpadView");

const ScratchpadView = () => {
  let [state, dispatch] = useReducer(
    (state: { count: number }) => {
      logger("dispatch", state);
      return { count: state.count + 2 };
    },
    { count: 0 }
  );
  return (
    <>
      <div>Current count: {state.count}</div>
      <button
        onClick={(_: any) => {
          dispatch();
        }}
      >
        Increment
      </button>
    </>
  );
};

export default ScratchpadView;
