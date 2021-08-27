import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "react-router-dom";

import LoginView from ".";

describe("CreateAccountView", () => {
  it("create account form", async () => {
    const client = new QueryClient();
    const history = createMemoryHistory();
    const result = render(
      <QueryClientProvider client={client}>
        <Router history={history}>
          <LoginView />
        </Router>
      </QueryClientProvider>
    );
    // logRoles(result.container);
    const emailInput = await screen.findByLabelText(/Email Address/i);
    const passwordInput = await screen.findByLabelText(/Password/i);
    expect(emailInput).toBeInTheDocument().toHaveFocus();
    expect(passwordInput).toBeInTheDocument();
    // FIXME 26/08/20 psacawa: Error: "not wrapped in act"
    // userEvent.type(emailInput, "user1@fake.com");
    // userEvent.type(passwordInput, "sdfgsdfg");
  });
});
