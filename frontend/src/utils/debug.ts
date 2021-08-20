export const getLogger = (name: string) => {
  if (process.env.NODE_ENV === "production") {
    return console.log;
  } else {
    return console.log;
  }
};

export const setupInfo = () => {
  (window as any).info = () => {
    console.log(`git commit:  ${process.env.REACT_GIT_HASH}`);
  };
};
