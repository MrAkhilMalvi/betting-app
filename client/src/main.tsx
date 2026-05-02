import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"

import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
     <Toaster position="top-right" />
    <App />
  </GoogleOAuthProvider>
);