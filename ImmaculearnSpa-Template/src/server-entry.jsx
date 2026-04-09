import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router";

import Routes from "./Routes";

import "./index.css";
// import { UserProvider } from "./contexts/user/userContextProvider";
// import { SpaceProvider } from "./contexts/space/spaceContextProvider";

export function render(url, context) {
  return ReactDOMServer.renderToString(
    <StaticRouter location={url} context={context}>
      {/* <UserProvider> */}
        {/* <SpaceProvider> */}
          <Routes />
        {/* </SpaceProvider> */}
      {/* </UserProvider> */}
    </StaticRouter>
  );
}
