import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";

import Routes from "./Routes";

import "./index.css";
import { UserProvider } from "./contexts/user/userContextProvider";

export function render(url, context) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      <UserProvider>
        <Routes />
      </UserProvider>
    </StaticRouter>
  );
}
