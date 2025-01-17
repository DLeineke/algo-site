import { useState } from "react";
import "./Home.css";

const Home = () => {
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const handleMouseDown = () => {
    setIsPanning(true);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setGridOffset((prevOffset) => {
        const newOffsetX = prevOffset.x + e.movementX;
        const newOffsetY = prevOffset.y + e.movementY;

        // Calculate the boundaries
        const maxOffsetX = 0;
        const maxOffsetY = 0;
        const minOffsetX = -2 * window.innerWidth; // Since the grid is 300vw
        const minOffsetY = -2 * window.innerHeight; // Since the grid is 300vh

        return {
          x: Math.min(maxOffsetX, Math.max(minOffsetX, newOffsetX)),
          y: Math.min(maxOffsetY, Math.max(minOffsetY, newOffsetY)),
        };
      });
    }
  };

  return (
    <div className="home-container">
      <div className="button-bar">
        <button className="action-button">Search</button>
        <button className="action-button">Sort</button>
        <button className="action-button">Traverse</button>
      </div>
      <div
        className="grid"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)`,
        }}
      >
        {/* Grid content goes here */}
      </div>
    </div>
  );
};

export default Home;
