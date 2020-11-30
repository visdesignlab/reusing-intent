import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [text, setText] = useState("What's Up?");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/hello")
      .then((response) => response.text())
      .then((data) => setText(data));
  }, []);

  return <div className="App">{text}</div>;
}

export default App;
