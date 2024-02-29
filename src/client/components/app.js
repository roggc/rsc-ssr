import React, { useState } from "react";
import styled from "styled-components";
import imgReact from "src/client/assets/react.png";
import Image from "./image";
import { RSC } from "rsc-ssr-module/client";
import { useAtom } from "src/client/atoms";

export default function App() {
  const [softKey, setSoftKey] = useState(0);
  const [counter, setCounter] = useAtom("counter");

  return (
    <Container>
      <Title>RSC + SSR</Title>
      <Image src={imgReact} maxWidth="600px" borderRadius="10px" />
      <Div>
        <button onClick={() => setSoftKey((sK) => sK + 1)}>
          get Greeting of the Day (from server)
        </button>
        {softKey > 0 && (
          <RSC componentName="greeting" softKey={softKey}>
            loading greeting ...
          </RSC>
        )}
      </Div>
      <Counters>
        <div>
          <button onClick={() => setCounter((c) => c + 1)}>+</button>
          {counter}
        </div>
      </Counters>
      <Div>
        This is a setup for RSC (React Server Components) plus SSR (Server Side
        Rendering) development. It has been bootstrapped with{" "}
        <strong>npx create-rsc-app@latest my-app --ssr</strong>.
      </Div>
      <Div>
        Another setup for RSC development without SSR can be bootstrapped with{" "}
        <strong>npx create-rsc-app@latest my-app</strong>.
      </Div>
      <Div>
        It has included{" "}
        <a href="https://styled-components.com/" target="_blank">
          styled-components
        </a>{" "}
        and{" "}
        <a href="https://www.npmjs.com/package/jotai-wrapper" target="_blank">
          jotai-wrapper
        </a>
        , a tiny library around jotai to manage global state.
      </Div>
      <Div>
        With this setup you can build SPA's with secret keys to fetch an API
        hidden from the Client (browser) or fetch some database in the server
        with Prisma.
      </Div>
    </Container>
  );
}

const Div = styled.div`
  text-align: center;
`;

const Title = styled(Div)`
  font-size: ${({ theme }) => theme.title.fontSize};
  font-weight: 700;
`;

const Container = styled.div`
  font-family: sans-serif;
  height: 97vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
`;

const Counters = styled.div`
  display: flex;
  gap: 10px;
`;
