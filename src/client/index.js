import { getInitialJSX } from "rsc-ssr-module/client";
import { hydrateRoot } from "react-dom/client";

hydrateRoot(document, await getInitialJSX());
