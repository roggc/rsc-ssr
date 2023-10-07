import { getApp } from "rsc-ssr-module/server";
import Router from "./components/router.js";

const app = getApp(Router);
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
