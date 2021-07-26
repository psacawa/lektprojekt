import { ReportHandler } from "web-vitals";
import { getCLS, getFID, getLCP } from "web-vitals";

declare let gtag: Function;
// from https://github.com/GoogleChrome/web-vitals#using-gtagjs-google-analytics-4
function sendToGoogleAnalytics({ name, delta, value, id }: any) {
  // Assumes the global `gtag()` function exists, see:
  // https://developers.google.com/analytics/devguides/collection/ga4
  gtag("event", name, {
    value: delta,
    metric_id: id,
    metric_value: value,
    metric_delta: delta,
  });
}

// in production user gtag, else just use console.log
const reportWebVitals =
  process.env.NODE_ENV == "production"
    ? () => reportWebVitalsWithHandler(sendToGoogleAnalytics)
    : () => reportWebVitalsWithHandler(console.log);

const reportWebVitalsWithHandler = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
