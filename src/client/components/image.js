import styled from "styled-components";
import React from "react";

const Image = styled(({ maxWidth, borderRadius, ...props }) => (
  <img {...props} />
))`
  ${({ maxWidth }) => (!!maxWidth ? `max-width:${maxWidth};` : "")}
  ${({ borderRadius }) =>
    !!borderRadius ? `border-radius:${borderRadius}` : ""}
`;

export default Image;
