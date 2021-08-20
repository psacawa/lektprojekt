import { render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "react-router";

import FallbackView from ".";

describe("FallbackView", () => {
  it("fake path yields FallbackView", () => {
    const history = createMemoryHistory({ initialEntries: ["/fake-path"] });
    const client = new QueryClient();
    const result = render(
      <QueryClientProvider {...{ client }}>
        <Router {...{ history }}>
          <FallbackView />
        </Router>
      </QueryClientProvider>
    );
    expect(history.location.pathname).toBe("/");
  });
});

// TODO 19/08/20 psacawa: add other routing tssts
