import React from "react";
import Greeting from "./greeting.js";
import { RCC } from "rsc-ssr-module/server";
import theme from "../../client/theme.js";

const title = "My App";

const Router = async ({ componentName, props }) => {
  switch (componentName) {
    case "":
      return (
        <RCC __isClient__="components/theme-provider" theme={theme}>
          <RCC __isClient__="slices">
            <RCC __isClient__="components/layout" title={title}>
              <RCC __isClient__="components/app" />
            </RCC>
          </RCC>
        </RCC>
      );
    case "greeting":
      return <Greeting {...props} />;
    default:
      return <RCC __isClient__="components/ups" />;
  }
};

export default Router;
