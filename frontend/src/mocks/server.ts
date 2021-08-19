import languages from "mocks/languages.json";
import supportedLanguagePairs from "mocks/supported-language-pairs.json";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { apiRoot } from "../constants";

const handlers = [
  rest.get(`${apiRoot}languages/`, async (req, res, ctx) => {
    return res(ctx.json(languages));
  }),
  rest.get(`${apiRoot}supported-language-pairs`, (req, res, ctx) => {
    return res(ctx.json(supportedLanguagePairs));
  }),
];

const server = setupServer(...handlers);
export { server };
