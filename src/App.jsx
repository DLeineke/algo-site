import { useState } from "react";
import Home from "./components/Home";
import Welcome from "./components/Welcome";

const App = () => {
  const [inputData, setInputData] = useState("");
  const [showHome, setShowHome] = useState(false);

  // Processes input data and converts it to node objects
  // Format: "1,2,3" -> [{id: 0, value: 1, x: rand, y: rand}, ...]
  const handleDataSubmit = (data) => {
    const buttonBarHeight = 60; // Height of button bar plus padding
    const numbers = data.split(",").map((num, index) => ({
      id: index,
      value: parseInt(num.trim()),
      x: Math.random() * 500,
      y:
        buttonBarHeight +
        Math.random() * (window.innerHeight - buttonBarHeight),
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
