import { getRoles, logRoles, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "react-router-dom";

import CreateAccountView from "./CreateAccountView";

describe("CreateAccountView", () => {
  it("create account form", () => {
    const client = new QueryClient();
    const history = createMemoryHistory();
    const result = render(
      <QueryClientProvider client={client}>
        <Router history={history}>
          <CreateAccountView />
        </Router>
      </QueryClientProvider>
    );
    // logRoles(result.container);
    expect(
      screen.getByLabelText((text, elt) => text.startsWith("Username"))
    ).toHaveFocus();
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
  });
});
