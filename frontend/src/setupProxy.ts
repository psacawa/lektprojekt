const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  for (path of ["/api", "/auth", "/csrf-token", "/admin"]) {
    app.use(
      path,
      createProxyMiddleware({
        target: "http://localhost:8000",
      })
    );
  }
};
