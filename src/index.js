import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import rootReducer from "./components/reducer";

import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
const store =configureStore({
  reducer: rootReducer,
})
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster/>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);