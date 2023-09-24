# RSC + SSR

This is a setup for development with RSC (React Server Components) plus SSR (Server Side Rendering). There is another setup to develop with RSC but without SSR, can be found [here](https://github.com/roggc/rsc).

With this setup you can build SPA's with React and hide secret keys to fetch an API in the server or fetch a database with Prisma in the server. It's a fullstack setup with React.

## How to install and run the project.

1. **npm i**
2. **npm run dev**
3. **npm run app** (in a new terminal window)
4. enter **localhost:8080** in the browser.

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

This RSC awaits for a promise to fulfill (500 ms) and then calls `RCC` RSC with `greeting` prop and `__isClient__` prop. The important thing here are the props, the `RCC` RSC is like this:

```javascript
// I am a RSC. I am located in the 'src/server/components' folder.
export default async function RCC() {
  return null;
}
```

So you see, it does nothing. Its purpose it's just to create an object when called with `React.createElement` with the props passed.

Now let's talk about the `__isClient__` prop. This prop is special, it indicates the server that this is a RCC and must not be processed on the server but on the client (browser). The prop itself is not passed to the client, the server filters it before sending the information to the client. It stores information about where the RCC can be found relative to the utility function `fillJSXWithClientComponents`. This utility function dynamically imports the RCC's in the client. So if this utility function needs the information stored in the `__isClient__` prop and I have said that the server filters this prop and don't send it to the client, how the utility function knows where to find the RCC's? Because the server stores the info in `__isClient__` prop in the `type` field of the JSX sent to the client. Remember that `React.createElement` creates an object, and one of the fields of this object is `type`. This serves React to know if the JSX it's a HTMML tag, or a function component, or whatelse. Since functions cannot be stringified and sent to the client from the server, the server stores in `type` field where to find the RCC in the client, and the client, with the use of `fillJSXWithClientComponents` dynamically imports the RCC.

```javascript
export async function fillJSXWithClientComponents(jsx) {
  // ...
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      // ...
      } else if (typeof jsx.type === "object" && jsx.type.file) {
        return {
          ...jsx,
          type: (await import(jsx.type.file)).default, // <-- here is where the dynamic import of the RCC occurs in the client
          props: await fillJSXWithClientComponents(jsx.props),
        };
      } else throw new Error("Not implemented.");
    } else {
    // ....
}
```

And this is in the server, before sending the information to the client:

```javascript
export async function renderJSXToClientJSX(jsx, key = null) {
  // ...
  } else if (typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {
      if (jsx.type === Symbol.for("react.fragment")) {
        // ...
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        if (Object.keys(props).some((k) => k === "__isClient__")) { // <-- here we detect the special prop
          return {
            ...jsx,
            type: { file: jsx.props.__isClient__ }, // <-- here we store the info in the 'type' field of the JSX
            props: await renderJSXToClientJSX(
              Object.fromEntries(
                Object.entries(jsx.props).filter(
                  ([key]) => key !== "__isClient__"  // <-- here we filter the __isClient__ prop, don't pass it to the client
                )
              )
            ),
            key: key ?? jsx.key,
          };
        } else {
          const returnedJsx = await Component(props);
          return await renderJSXToClientJSX(returnedJsx);
        }
      // ...
}
```

These are implementation details, it's just for you to understand how it works.

The thing is we defined a `Greeting` RCC and a `Greeting` RSC. Now we must put in the `Router` RSC the `greeting` switch case:

```javascript
// I am a RSC ...
import React from "react";
import RCC from "./rcc.js";
import Greeting from "./greeting.js";

export default async function Router({ url, body: { props } }) {
  switch (url.pathname.slice(1)) {
    // ...
    case "greeting":
      return <Greeting {...props} />;
    default:
      return <RCC __isClient__="../components/ups.js" />;
  }
}
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

You see how we fetch the server in it. Again, these are implementation details.

The thing is how we "call" the server for the `Greeting` RSC. As I have said, we use the `RSC` RCC, like this:

```javascript
// I am a RCC
import React from "react";
import RSC from "./rsc.js";

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
  return <RCC __isClient__="../components/say-hello.js" greeting={greeting} />;
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

The call to `RSC` RCC from any RCC is like a barrier for the flow of props which are functions, because functions cannot be stringified. So in this case use [react-context-slices](https://react-context-slices.github.io/) to set the function into the global shared state and then recover its value down in the tree of RCC's, bypassing in this way the barrier that `RSC` RCC's are for this type of values (functions).

## React.Suspense not implemented

React.Suspense is not implemented in this setup so don't use it (you will get an error or exception thrown). But in theory you don't need it, with the use of `RSC` RCC that fetches the server. If I am wrong about this point let me know.
