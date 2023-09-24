# RSC + SSR

This is a setup for development with RSC (React Server Components) plus SSR (Server Side Rendering). There is another setup to develop with RSC but without SSR, can be found [here](https://github.com/roggc/rsc).

With this setup you can build SPA's with React and hide secret keys to fetch an API in the server or fetch a database with Prisma in the server. It's a fullstack setup with React.

## How to install and run the project.

1. **npm i**
2. **npm run dev**
3. **npm run app** (in a new terminal window)
4. enter **localhost:8080** in the browser.

## React.Suspense not implemented (or how to develop with this setup)

React.Suspense is not implemented in this setup, so don't use it. But in theory you won't need it with the use of the `RSC` RCC (React Client Component).

This is the code for the `RSC` RCC:

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

So you see, this RCC calls the server to fetch for an RSC. This is the code for the `Router` RSC, the one which receives the call and handles it:

```javascript
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
```

So you see, when it is not first load it returns an RSC (`Greeting`). This RSC will return the final RCC. Let's see the definition for `Greeting` RSC:

```javascript
import React from "react";
import RCC from "./rcc";

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

  return <RCC greeting={greeting} __isClient__="../components/greeting.js" />;
}
```

It just returns `RCC` RSC with the `__isClient__` prop set to where the file for `Greeting` RCC can be found relative to the utility function `fillJSXwithClientComponents`. And this is the `Layout` RCC:

```javascript
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
```

And the `App` RCC:

```javascript
import React, { useState } from "react";
// ...
import RSC from "./rsc";
// ...

export default function App() {
  const [count, setCount] = useState(0);
  // ...

  return (
    <Container>
      <Title>RSC + SSR</Title>
      <Image src={imgReact} maxWidth="600px" borderRadius="10px" />
      <Div>
        {" "}
        <button onClick={() => setCount((c) => c + 1)}>
          get Greeting of the Day (from server)
        </button>
        {count > 0 && (
          <RSC componentName="greeting" key={count}>
            loading greeting ...
          </RSC>
        )}
      </Div>
      {/*...*/}
    </Container>
  );
}

// ...
```

The important part is here:

```javascript
<RSC componentName="greeting" key={count}>
  loading greeting ...
</RSC>
```

You see how the `App` RCC doesn't call directly to `Greeting` RCC, but it calls instead to `RSC` RCC, which will fetch JSX for `Greeting` RSC, wich will return JSX for `Greeting` RCC with proper data from the server.

So this is the cycle:

From an RCC call to `RSC` RCC passing to it the name of the RSC component we want to fetch (usually `some-component-name`). Then in the `Router` RSC the `SomeComponentName` RSC is called which fetchs some data and returns `RCC` RSC pointing to `SomeComponentName` RCC with proper data, that gets rendered in the Client.

`RCC` RSC is a RSC that does nothing. Next is its definition:

```javascript
export default async function RCC() {
  return null;
}
```

Its only purpose is to create a JSX object (a javascript object in fact, let's say rendered JSX or the result of the call to `React.createElement`). The implementation uses the information in this object to know it's a RCC component, so must not be processed on the server but on the Client (browser). On the Client the relative path will be used to restore (dynamically import) the actual or referenced RCC (by this relative path with respect to the utility function `fillJSXwithClientComponents`). So at the end we have a JSX with the RCC and data (props) required (got from the server).

Here is another example of this cycle of development. Let's say we want a `SayHello` RCC that receives a `greeting` prop, like this:

```javascript
export default function SayHello({ greeting }) {
  return <>{greeting}</>;
}
```

This `greeting` prop must be given by the server. So we create an RSC that do the job:

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
  return <RCC __isClient__="../components/say-hello.js" greeting={greeting} />;
}
```

You see how `SayHello` RSC returns a call to `RCC` RSC with the `__isClient__` prop storing the relative path with respect to the utility function `fillJSXwithClientComponents` where the RCC can be found, and passing also a prop to this RCC which is `greeting` (the data fetched by the `SayHello` RSC). The `__isClient__` prop is only used by the server and it is not passed down to the `SayHello` RCC, as `greeting` or any other prop is (is a special prop used by this implementation).

Now we must add the switch case in the `Router` RSC:

```javascript
export default async function Router({ url, body: { props } }) {
  switch (url.pathname.slice(1)) {
    // ...
    case "say-hello":
      return <SayHello {...props} />;
    default:
      return <RCC __isClient__="../components/ups.js" />;
  }
}
```

Last step is to 'call' `SayHello` RSC from a RCC in the Client. This is done through special RCC named `RSC`, like this:

```javascript
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

So the `name` prop passed to `RSC` RCC goes to the server and ends up in `SayHello` RSC, which uses it to get an appropiate `greeting` for this `name`.

Calls to `RSC` RCC can be nested, that is, `SayHello` RCC could also call to `RSC` RCC. In this case we have a waterfall effect (until first call is resolved, second nested call will not begin).

`RSC` RCC is like a barrier for functions to be passed as props in the React tree, because functions cannot be stringified (and this is what `RSC` RCC does, stringifies props to be passed to the server). So for this reason [react-context-slices](https://react-context-slices.github.io/) is included in the setup. It's a library to manage state in React that seamlessly integrates both Redux and React Context with zero-boilerplate. So when this happens, that you must bypass the barrier that `RSC` RCC are for function values, you can store these function values in the global state and recover them at any other RCC down the tree.

## More Info

An article explaining the theory behind this project can be found [here](https://medium.com/@roggc9/rsc-ssr-rcc-react-client-components-implementation-from-scratch-e96ba0d6e1b4).

Another article explaining this setup and the theory behind it can be found [here](https://medium.com/@roggc9/a-setup-for-rsc-development-1524cb1015ca).
