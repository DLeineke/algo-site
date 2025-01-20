import PropTypes from "prop-types";
import { useState } from "react";
import "./Home.css";

const Home = ({ initialNodes }) => {
  // State for grid movement and node dragging
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [nodes, setNodes] = useState(initialNodes);
  const [draggedNode, setDraggedNode] = useState(null);

  // State for button navigation and search functionality
  const [currentButtons, setCurrentButtons] = useState("main");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [foundNodeId, setFoundNodeId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  // Configuration for different button sets and their actions
  const buttonSets = {
    main: [
      { label: "Search", onClick: () => setCurrentButtons("search") },
      { label: "Sort", onClick: () => setCurrentButtons("sort") },
      { label: "Traverse", onClick: () => setCurrentButtons("traverse") },
    ],
    search: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      {
        label: "Linear Search",
        onClick: () => setShowSearchInput(true),
      },
      { label: "Binary Search", onClick: () => {} },
    ],
    sort: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Bubble Sort", onClick: () => {} },
      { label: "Quick Sort", onClick: () => {} },
    ],
    traverse: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Pre-order", onClick: () => {} },
      { label: "Post-order", onClick: () => {} },
    ],
  };

  // Handles mouse down events for both node dragging and grid panning
  const handleMouseDown = (e) => {
    if (e.target.classList.contains("node")) {
      const nodeId = Number(e.target.dataset.id);
      setDraggedNode(nodeId);
    } else {
      setIsPanning(true);
    }
  };

  // Resets dragging and panning states on mouse up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  // Handles both grid panning and node dragging movement
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
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === draggedNode) {
            const newX = node.x + e.movementX;
            const newY = node.y + e.movementY;

            const nodeSize = 44;
            const halfNode = nodeSize / 2;

            const maxX = (300 * window.innerWidth) / 100 - halfNode;
            const maxY = (300 * window.innerHeight) / 100 - halfNode;
            const minX = halfNode;
            const minY = halfNode;

            return {
              ...node,
              x: Math.min(maxX, Math.max(minX, newX)),
              y: Math.min(maxY, Math.max(minY, newY)),
            };
          }
          return node;
        })
      );
    }
  };

  // Processes search input and initiates linear search
  const handleSearchSubmit = (e) => {
    if (e.key === "Enter") {
      const value = parseInt(e.target.value);
      if (!isNaN(value)) {
        setShowSearchInput(false);
        setSearchValue("");
        setIsSearching(true);
        startLinearSearch(value);
      }
    }
  };

  // Performs linear search animation from left to right
  const startLinearSearch = (searchValue) => {
    setCurrentSearchIndex(0);
    setFoundNodeId(null);

    const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

    const searchStep = (index) => {
      if (index >= sortedNodes.length) {
        setIsSearching(false);
        setCurrentSearchIndex(-1);
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
        return;
      }

      const originalIndex = nodes.findIndex(
        (node) => node.id === sortedNodes[index].id
      );
      setCurrentSearchIndex(originalIndex);

      if (sortedNodes[index].value === searchValue) {
        setFoundNodeId(sortedNodes[index].id);
        setIsSearching(false);
        setCurrentSearchIndex(-1);
        return;
      }

      setTimeout(() => {
        searchStep(index + 1);
      }, 500);
    };

    searchStep(0);
  };

  return (
    <div className="home-container">
      <div className="button-bar">
        {buttonSets[currentButtons].map((button, index) => (
          <button
            key={index}
            className="action-button"
            onClick={button.onClick}
          >
            {button.label}
          </button>
        ))}
      </div>
      <div
        className="grid"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{
          transform: `translate(${gridOffset.x}px, ${gridOffset.y}px)`,
          pointerEvents: showSearchInput || isSearching ? "none" : "auto",
        }}
      >
        {nodes.map((node, index) => (
          <div
            key={node.id}
            className={`node ${
              currentSearchIndex === index ? "searching" : ""
            } ${foundNodeId === node.id ? "found" : ""}`}
            data-id={node.id}
            style={{
              transform: `translate(${node.x}px, ${node.y}px)`,
            }}
          >
            {node.value}
          </div>
        ))}
      </div>
      {showSearchInput && (
        <div className="search-overlay">
          <input
            type="number"
            className="search-input"
            placeholder="Enter a number to search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleSearchSubmit}
            autoFocus
          />
        </div>
      )}
      {showNotification && <div className="notification">Node not found</div>}
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
