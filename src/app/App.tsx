import { BrowserRouter } from "react-router-dom";
import { Providers } from "./providers";
import { AppRoutes } from "./routes";
import { useParentAuth } from "../hooks/useParentAuth";

const App = () => {
  useParentAuth();

  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  );
};

export default App;
