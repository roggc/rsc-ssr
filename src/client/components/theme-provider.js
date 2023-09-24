import { ThemeProvider as StyledThemeProvider } from "styled-components";
import React from "react";

export default function ThemeProvider({ children, theme }) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}
