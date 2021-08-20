import debug from "debug";
import process from "process";

export const getLogger = (name: string) => {
  if (process.env.NODE_ENV === "production") {
    return console.log;
  } else {
    return debug(name);
  }
};

export const setupInfo = () => {
  (window as any).info = () => {
    console.log(`git commit:  ${process.env.REACT_GIT_HASH}`);
  };
};
