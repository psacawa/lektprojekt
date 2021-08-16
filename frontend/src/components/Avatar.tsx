import { Avatar } from "@material-ui/core";
import { Person } from "@material-ui/icons";
import { useAuth } from "hooks";
import * as jdenticon from "jdenticon";
import React, { useEffect, useRef } from "react";

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

const LektAvatar = (props: React.HTMLAttributes<{}>) => {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  return (
    <>
      {user.has_profile_image ? (
        <Avatar variant="rounded" {...props}>
          <Person />
        </Avatar>
      ) : (
        <div {...props}>
          <Jdenticon size="100%" value={user.username} />
        </div>
      )}
    </>
  );
};

export default LektAvatar;
