export const drawerWidth = 260;
// Cross-origin requests on localhost don't work... a security feature of browsers perhaps?
export const origin = `https://${process.env.REACT_API_DOMAIN}/`;
export const apiRoot =
  process.env.NODE_ENV == "production" ? `${origin}api/` : "/api/";
export const authRoot =
  process.env.NODE_ENV == "production" ? `${origin}auth/` : "/auth/";
export const HOUR = 60 * 60 * 1000;
