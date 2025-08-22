import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/index.css";
import App from "./routes/App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignPage from "./routes/SignPage.tsx";
import TechnicalPage from "./routes/TechnicalPage.tsx";
import InterviewRoom from "./routes/InterviewRoom.tsx";
import InterviewSummary from "./routes/InterviewSummary.tsx";
import Behavioral from "./routes/Behavioral.tsx";
import Interviews from "./routes/Interviews.tsx";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/signin", element: <SignPage /> },
  { path: "/signup", element: <SignPage /> },
  { path: "/technical", element: <TechnicalPage /> },
  { path: "/behavioral", element: <Behavioral /> },
  { path: "/interview", element: <InterviewRoom /> },
  { path: "/interview/:sessionId", element: <InterviewRoom /> },
  { path: "/summary/:sessionId", element: <InterviewSummary /> },
  { path: "/interviews", element: <Interviews /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
