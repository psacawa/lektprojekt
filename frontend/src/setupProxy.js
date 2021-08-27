const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  let path;
  let proxymiddleware = createProxyMiddleware({
    target: "http://localhost:8000",
  });
  for (path of [
    "/api",
    "/auth",
    "/csrf-token",
    "/admin",
    "/password-reset",
    // "/payments",
    "/stripe",
  ]) {
    app.use(path, proxymiddleware);
  }
};
