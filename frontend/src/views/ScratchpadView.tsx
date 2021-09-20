import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { useState } from "react";
import { getLogger } from "utils";

interface Option {
  label: string;
  verbose: string;
}

const logger = getLogger("ScratchpadView");

let options: Option[] = [
  {
    label: "cypress.json",
    verbose: "      8 cypress.json",
  },
  {
    label: "default.conf",
    verbose: "     17 default.conf",
  },
  {
    label: "Dockerfile",
    verbose: "     13 Dockerfile",
  },
  {
    label: "localhost-key.pem",
    verbose: "     28 localhost-key.pem",
  },
  {
    label: "localhost.pem",
    verbose: "     24 localhost.pem",
  },
  {
    label: "package.json",
    verbose: "    233 package.json",
  },
  {
    label: "tsconfig.json",
    verbose: "     22 tsconfig.json",
  },
  {
    label: "yarn-error.log",
    verbose: "  13959 yarn-error.log",
  },
  {
    label: "yarn.lock",
    verbose: "  13697 yarn.lock",
  },
  {
    label: "razem",
    verbose: "  28001 razem",
  },
];

const ScratchpadView = () => {
  const [value, setValue] = useState<Option | null>(null);
  const [inputValue, setInputValue] = useState<string>("");
  return (
    <>
      <div>value={value?.verbose}</div>
      <div>inputValue={inputValue}</div>
      <Autocomplete
        {...{ value, inputValue, options }}
        getOptionLabel={(opt) => {
          return opt.label;
        }}
        renderInput={(params) => <TextField {...params}></TextField>}
        // renderOption={(opt) => opt.label}
        onChange={(ev, newValue, reason) => {
          logger(newValue);
          setValue(newValue);
        }}
        onInputChange={(ev, newInputValue, reason) => {
          setInputValue(newInputValue);
        }}
      />
    </>
  );
};

export default ScratchpadView;
