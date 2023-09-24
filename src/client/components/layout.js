import React from "react";
import App from "./app";

export default function Layout({ title }) {
  return (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>
        <App />
      </body>
    </html>
  );
}
