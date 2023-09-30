# RSC + SSR

This is a setup for development with RSC (React Server Components) plus SSR (Server Side Rendering). There is another setup to develop with RSC but without SSR, can be found [here](https://github.com/roggc/rsc).

With this setup you can build SPA's with React and hide secret keys to fetch an API in the server or fetch a database with Prisma in the server. It's a fullstack setup with React.

A site informing about the setup can be found [here](https://rsc-setup.netlify.app).

## How to create a project with this setup.

1. Type **_npx create-rsc-app name-of-your-app --ssr_** in a terminal window.
2. Type **_cd name-of-your-app_**.

## How to run the project for development.

3. Type **_npm run dev_** (this runs rollup in watch mode and creates the `dist` and `public` folders).
4. Type **_npm start_** in another terminal window (this will start the app).

Then you can just go to your browser an enter **_localhost:8080_** to see the app. Changes to the code will automatically be updated, but you must to manually reload the app on the browser to see them. Also, if you create or delete files, you must restart the bundler, that is, stop it and run again **_npm run dev_**.

## Instructions on how to develop with this setup

In this setup you develop normally as in any front-end app until you find a component that needs data from the server. Let's say, for example, you need to define a `Greeting` RCC (React Client Component) that needs data from the server:

```javascript
// I am a RCC. I am located in the 'src/client/components' folder.
import React from "react";

export default function Greeting({ greeting }) {
  return <>{greeting}</>;
}
```

This RCC needs data from the server, specifically the `greeting` prop. So then you define a `Greeting` RSC (React Server Component):

```javascript
// I am a RSC. I am located in the 'src/server/components' folder, and I am async.
import React from "react";
import { RCC } from "rsc-ssr-module/server";

export default async function Greeting() {
  const value = Math.random() < 0.5;
  const greeting = await new Promise((r) =>
    setTimeout(() => {
      switch (value) {
        case true:
          return r("Whatsupp!!!");
        case false:
          return r("How r u doing?");
      }
    }, 500)
  );

  return <RCC greeting={greeting} __isClient__="components/greeting" />;
}
```

This RSC awaits for a promise to fulfill (500 ms) and then calls `RCC` RSC with `greeting` prop and `__isClient__` prop. The important thing here are the props, the `RCC` RSC is like this:

```javascript
// I am a RSC.
export async function RCC() {
  return null;
}
```

So you see, it does nothing. Its purpose it's just to create an object when called with `React.createElement` with the props passed.

The `__isClient__` prop tells to the implementation where to find the RCC we want to call. As you see, the path where to find the RCC is relative to `src/client/`, and without an extension file at the end.

The thing is we defined a `Greeting` RCC and a `Greeting` RSC. Now we must put in the `Router` RSC the `greeting` switch case:

```javascript
// I am a RSC ...
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
```

The `Router` RSC handles the calls from the client and delivers content.

And how we fetch the server from the client? We use a special RCC named `RSC`. This is its definition:

```javascript
import React, { useEffect, useState } from "react";
import { fillJSXWithClientComponents, parseJSX } from "../utils/index.js";

export default function RSC({
  componentName,
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
```

You see how we fetch the server in it. These are implementation details.

The thing is how we "call" the server for the `Greeting` RSC. As I have said, we use the `RSC` RCC, like this:

```javascript
// I am a RCC
import React from "react";
import { RSC } from "rsc-ssr-module/client";

export default function SomeRCC() {
  // ...
  return (
    <>
      {/* ... */}
      <RSC componentName="greeting">loading ...</RSC>;{/* ... */}
    </>
  );
}
```

So, to recap, we defined a `Greeting` RCC, a `Greeting` RSC, put the `greeting` switch case in the `Router` RSC, and call the `RSC` RCC from a RCC in the client.

This must be done always you need a RCC with data from the server. Notice how the `Greeting` RCC it's never called directly from the client. The client calls to `RSC` RCC instead, passing the `componentName` to it.

You can pass props to `RSC` RCC:

```javascript
// I am a RCC
export default function SomeRCC() {
  // ...
  return (
    <>
      {/* ... */}
      <RSC componentName="say-hello" name="Roger">
        loading ...
      </RSC>
      {/* ... */}
    </>
  );
}
```

Then in `SayHello` RSC you get these props.

```javascript
// I am a RSC
export default async function SayHello({ name }) {
  const greeting = await new Promise((r) =>
    setTimeout(() => {
      switch (name) {
        case "Roger":
          return r("hey, whatsup...");
        default:
          return r("hello, how r u doing?");
      }
    }, 500)
  );
  return <RCC __isClient__="components/say-hello" greeting={greeting} />;
}
```

Then in your `SayHello` RCC you will have:

```javascript
export default function SayHello({ greeting }) {
  return <>{greeting}</>;
}
```

You see how we "called" the `RSC` RCC with a prop `name`, which was used to fetch data on the `SayHello` RSC, and then this data (`greeting`), was passed as another prop to the call of `RCC` RSC, which in turn ended up in the `SayHello` RCC.

The `Router` RSC will be then:

```javascript
export default async function Router({ componentName, props }) {
  switch (componentName) {
    // ...
    case "say-hello":
      return <SayHello {...props} />;
    default:
      return <RCC __isClient__="components/ups" />;
  }
}
```

The call to `RSC` RCC from any RCC is like a barrier for the flow of props which are functions, because functions cannot be stringified. So in this case use [react-context-slices](https://react-context-slices.github.io/) to set the function into the global shared state and then recover its value down in the tree of RCC's, bypassing in this way the barrier that `RSC` RCC's are for this type of values (functions).

## React.Suspense not implemented

React.Suspense is not implemented in this setup so don't use it (you will get an error or exception thrown). But in theory you don't need it, with the use of `RSC` RCC that fetches the server. If I am wrong about this point let me know.
