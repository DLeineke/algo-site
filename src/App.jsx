import { useState } from "react";
import Home from "./components/Home";
import Welcome from "./components/Welcome";

const App = () => {
  const [inputData, setInputData] = useState("");
  const [showHome, setShowHome] = useState(false);

  const handleDataSubmit = (data) => {
    // Convert the comma-separated string into an array of numbers
    const numbers = data.split(",").map((num, index) => ({
      id: index, // Use sequential integers instead of Math.random()
      value: parseInt(num.trim()),
      x: Math.random() * 500,
      y: Math.random() * 500,
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
