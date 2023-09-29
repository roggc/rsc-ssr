import React, { useState } from "react";
import styled from "styled-components";
import imgReact from "../assets/react.png";
import Image from "./image";
import { RSC } from "../../../rsc-ssr/client/components/rsc.js";
import { useSlice } from "../slices";

export default function App() {
  const [count, setCount] = useState(0);
  const [count1, setCount1] = useSlice("count1");
  const [count2, reduxDispatch, { increment }] = useSlice("count2");

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
      <Counters>
        <div>
          <button onClick={() => setCount1((c) => c + 1)}>+</button>
          {count1}
        </div>
        <div>
          <button onClick={() => reduxDispatch(increment())}>+</button>
          {count2}
        </div>
      </Counters>
      <Div>
        This is a setup for RSC (React Server Components) plus SSR (Server Side
        Rendering) development.
      </Div>
      <Div>
        Another setup for RSC development without SSR can be found{" "}
        <a href="https://github.com/roggc/rsc" target="_blank">
          here
        </a>
      </Div>
      <Div>
        It has included{" "}
        <a href="https://styled-components.com/" target="_blank">
          styled-components
        </a>{" "}
        and{" "}
        <a href="https://react-context-slices.github.io/" target="_blank">
          react-context-slices
        </a>
        , a library to manage state that seamlessly integrates both Redux and
        React Context with zero-boilerplate
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
