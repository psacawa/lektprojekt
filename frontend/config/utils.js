// this util computes a python style "import string" so DefinePlugin can supply it
// under the name __filebasename
// src/views/HomeView.tsx -> views/HomeView.tsc
// info: {module: webpack.NormalModule }
const generateModuleString = (info) => {
  let pathComponents = info.module.resource.split("/");
  let subPathIdx = pathComponents.indexOf("src");
  let modulePath = pathComponents.slice(subPathIdx + 1).join("/");
  return JSON.stringify(modulePath);
};

module.exports = { generateModuleString };
