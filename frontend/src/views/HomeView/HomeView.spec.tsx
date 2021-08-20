import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { server } from "mocks/server";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Router } from "react-router";

import HomeView, { LanguagePairSelectWidget } from "./HomeView";

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe("HomeView", () => {
  it("renders", () => {
    const client = new QueryClient();
    const result = render(
      <QueryClientProvider client={client}>
        <HomeView />
      </QueryClientProvider>
    );
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
    expect(screen.getByText("LexQuest")).toBeInTheDocument();
  });

  it("language pair selection", async () => {
    const client = new QueryClient();
    const history = createMemoryHistory();
    // history.push = jest.mock("push") as any
    const result = render(
      <QueryClientProvider {...{ client }}>
        <Router {...{ history }}>
          <LanguagePairSelectWidget />
        </Router>
      </QueryClientProvider>
    );

    // target language
    expect(await screen.findByText("Spanish")).toBeInTheDocument();
    expect(await screen.findByText("English")).toBeInTheDocument();
    expect(await screen.findByText("French")).toBeInTheDocument();
    userEvent.click(screen.getByText("Spanish"), new MouseEvent("click"));

    // base language
    expect(await screen.findByText("English")).toBeInTheDocument();
    expect(screen.queryByText("Spanish")).not.toBeInTheDocument();
    expect(screen.queryByText("French")).not.toBeInTheDocument();
    userEvent.click(screen.getByText("English"));
    expect(history.location.pathname).toBe("/courses/");
  });
});
