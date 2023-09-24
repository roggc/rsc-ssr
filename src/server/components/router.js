import React from "react";
import theme from "../../client/theme.js";
import RCC from "./rcc.js";
import Greeting from "./greeting.js";

const title = "My app";

export default async function Router({ url, body: { props } }) {
  switch (url.pathname.slice(1)) {
    case "":
      return (
        <RCC __isClient__="../components/theme-provider.js" theme={theme}>
          <RCC __isClient__="../slices.js">
            <RCC __isClient__="../components/layout.js" title={title} />
          </RCC>
        </RCC>
      );
    case "greeting":
      return <Greeting {...props} />;
    default:
      return <RCC __isClient__="../components/ups.js" />;
  }
}
