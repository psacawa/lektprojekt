import { getRoles, RenderResult } from "@testing-library/react";
// for debugging unit tests using testing-library /(get|find|query)(All)?ByRole/
// prints all roles and the ids of the HTMLElements in the render result with those roles
// basically superseded by import("@testing-library/dom").logRoles
// kept for posterity
export const printRoles = (elt: HTMLElement) => {
  Object.entries(getRoles(elt)).forEach(([key, val]) => {
    if (val.length > 0) {
      let ids = val.map((elt) => elt.id).join(", ");
      console.log(key, `[${ids}]`);
    }
  });
};

const eltToString = (elt: HTMLElement) => {
  return elt.id || `${elt.nodeType} ${elt.className}`;
};
