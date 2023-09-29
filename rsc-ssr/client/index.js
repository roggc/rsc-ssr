import { fillJSXWithClientComponents, parseJSX } from "./utils/index.js";

export async function getInitialJSX() {
  const clientJSX = JSON.parse(
    JSON.stringify(window.__INITIAL_CLIENT_JSX_STRING__),
    parseJSX
  );
  return await fillJSXWithClientComponents(clientJSX);
}
