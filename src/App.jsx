import { useState } from "react";
import Home from "./components/Home/Home";
import Welcome from "./components/Welcome";

const App = () => {
  const [inputData, setInputData] = useState("");
  const [showHome, setShowHome] = useState(false);

  const handleDataSubmit = (data) => {
    const buttonBarHeight = 60; // Height of button bar plus padding
    const numbers = data.split(",").map((num, index) => ({
      id: index,
      value: parseInt(num.trim()),
      x: Math.random() * 500,
      y:
        buttonBarHeight +
        Math.random() * (window.innerHeight - buttonBarHeight), // Ensure Y position starts below button bar
    }));

    setInputData(numbers);
    setShowHome(true);
  };

  return (
    <div>
      {!showHome ? (
        <Welcome onDataSubmit={handleDataSubmit} />
      ) : (
        <Home initialNodes={inputData} />
      )}
    </div>
  );
};

export default App;
