import PropTypes from "prop-types";
import { useState } from "react";
import "./Home.css";

const Home = ({ initialNodes }) => {
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [nodes, setNodes] = useState(initialNodes);
  const [draggedNode, setDraggedNode] = useState(null);

  const handleMouseDown = (e) => {
    // Check if we're clicking on a node
    if (e.target.classList.contains("node")) {
      const nodeId = Number(e.target.dataset.id);
      setDraggedNode(nodeId);
    } else {
      setIsPanning(true);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setGridOffset((prevOffset) => {
        const newOffsetX = prevOffset.x + e.movementX;
        const newOffsetY = prevOffset.y + e.movementY;

        const maxOffsetX = 0;
        const maxOffsetY = 0;
        const minOffsetX = -2 * window.innerWidth;
        const minOffsetY = -2 * window.innerHeight;

        return {
          x: Math.min(maxOffsetX, Math.max(minOffsetX, newOffsetX)),
          y: Math.min(maxOffsetY, Math.max(minOffsetY, newOffsetY)),
        };
      });
    } else if (draggedNode !== null) {
      // Update node position
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === draggedNode) {
            return {
              ...node,
              x: node.x + e.movementX,
              y: node.y + e.movementY,
            };
          }
          return node;
        })
      );
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
        {nodes.map((node) => (
          <div
            key={node.id}
            className="node"
            data-id={node.id}
            style={{
              transform: `translate(${node.x}px, ${node.y}px)`,
            }}
          >
            {node.value}
          </div>
        ))}
      </div>
    </div>
  );
};

Home.propTypes = {
  initialNodes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      value: PropTypes.number,
      x: PropTypes.number,
      y: PropTypes.number,
    })
  ).isRequired,
};

export default Home;
