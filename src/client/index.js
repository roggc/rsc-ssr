import { getInitialJSX } from "../../rsc-ssr/client/index.js";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document, await getInitialJSX());
