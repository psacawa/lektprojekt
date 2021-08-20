import languages from "mocks/languages.json";
import supportedLanguagePairs from "mocks/supported-language-pairs.json";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { apiRoot } from "../constants";

const handlers = [
  rest.get(`${apiRoot}languages/`, async (_req, res, ctx) => {
    return res(ctx.json(languages));
  }),
  rest.get(`${apiRoot}supported-language-pairs/`, (_req, res, ctx) => {
    return res(ctx.json(supportedLanguagePairs));
  }),
  rest.get(`${apiRoot}courses/`, (_req, res, ctx) => {
    return res(ctx.json({}));
  }),
  rest.post(`${apiRoot}courses/`, (_req, res, ctx) => {
    return res(ctx.json({}));
  }),
];

export const server = setupServer(...handlers);
