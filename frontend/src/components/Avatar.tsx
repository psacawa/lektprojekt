import { Avatar, makeStyles } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import clsx from "clsx";
import { useAuth } from "hooks";
import * as jdenticon from "jdenticon";
import React, { Component, useEffect, useRef } from "react";

const useStyles = makeStyles({
  photo: {
    transition: "all 300ms linear",
    overflow: "hidden",
    float: "left",
    zIndex: 5,
    marginRight: "11px",
    marginLeft: "23px",
    borderRadius: "10%",
    backgroundColor: "#ccc",
  },
  thumbnail: {
    width: "34px",
    height: "34px",
  },
});

// react wrapper for jdenticon library
const Jdenticon = ({ value = "test", size = "100%" }) => {
  const icon = useRef(null);
  useEffect(() => {
    jdenticon.update(icon.current as any, value);
  }, [value]);

  return (
    <div>
      <svg data-jdenticon-value={value} height={size} ref={icon} width={size} />
    </div>
  );
};

interface Props {
  fullSize?: boolean;
}

const LektAvatar = ({ fullSize = false }: Props) => {
  const { user } = useAuth();
  const classes = useStyles();
  if (!user) {
    return null;
  }
  const avatarClassName = clsx(classes.photo, {
    [classes.thumbnail]: !fullSize,
  });
  console.log(avatarClassName);
  return (
    <>
      {user.has_profile_image ? (
        <Avatar className={avatarClassName} variant="rounded">
          <Person />
        </Avatar>
      ) : (
        <div className={avatarClassName}>
          <Jdenticon size="100%" value={user.username} />
        </div>
      )}
    </>
  );
};

export default LektAvatar;
