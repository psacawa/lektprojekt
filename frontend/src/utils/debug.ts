import debug from "debug";
export const getLogger = (name: string) => {
  // TODO 20/09/20 psacawa: sort out issues with debug npm module
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
