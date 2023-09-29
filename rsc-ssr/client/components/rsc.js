import React, { useEffect, useState } from "react";
import { fillJSXWithClientComponents, parseJSX } from "../utils/index.js";

export function RSC({
  componentName = "__no_component_name__",
  children = <>loading ...</>,
  errorJSX = <>something went wrong</>,
  ...props
}) {
  const [JSX, setJSX] = useState(children);
  const body = JSON.stringify({ props });

  useEffect(() => {
    setJSX(children);
    fetch(`/${componentName}`, {
      method: "post",
      headers: { "content-type": "application/json" },
      body,
    })
      .then(async (response) => {
        const clientJSXString = await response.text();
        const clientJSX = JSON.parse(clientJSXString, parseJSX);
        const fixedClientJSX = await fillJSXWithClientComponents(clientJSX);
        setJSX(fixedClientJSX);
      })
      .catch(() => setJSX(errorJSX));
  }, [componentName, body]);

  return JSX;
}
