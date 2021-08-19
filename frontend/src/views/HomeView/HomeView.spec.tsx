import { fireEvent, render, screen } from "@testing-library/react";
import { server } from "mocks/server";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

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
    const result = render(
      <QueryClientProvider {...{ client }}>
        <LanguagePairSelectWidget />
      </QueryClientProvider>
    );
    expect(await screen.findByText("Spanish")).toBeInTheDocument();
    expect(await screen.findByText("English")).toBeInTheDocument();
    expect(await screen.findByText("French")).toBeInTheDocument();
    fireEvent(screen.getByText("Spanish"), new MouseEvent("click"));
    expect(await screen.findByText("English")).toBeInTheDocument();
    expect(await screen.findByText("dfasdfnglish")).toBeInTheDocument();
    expect(await screen.findByText("Spanish")).not.toBeInTheDocument();
    expect(await screen.findByText("French")).not.toBeInTheDocument();
  });
});
