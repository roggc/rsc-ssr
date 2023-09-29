import React from "react";
import { RCC } from "./rcc.js";

async function Router({ componentName }) {
  switch (componentName) {
    default:
      return <RCC __isFramework__="components/ups" />;
  }
}

export const withRouter =
  (C) =>
  async ({ componentName, props }) => {
    const JSX = <C componentName={componentName} props={props} />;
    if (JSX) {
      console.log("JSX", JSX);
      const JSX2 = await JSX.type(JSX.props);
      if (JSX2) {
        return JSX2;
      }
    }
    return <Router componentName={componentName} />;
  };
