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
      {
        label: "Binary Search",
        onClick: () => {
          setShowSearchInput(true);
          setIsBinarySearch(true);
        },
      },
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

  // State for stepping control
  const [enableStepping, setEnableStepping] = useState(false);
  const [isAlgorithmRunning, setIsAlgorithmRunning] = useState(false);
  const [nextStep, setNextStep] = useState(null);

  // State for binary search
  const [isBinarySearch, setIsBinarySearch] = useState(false);

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
        if (isBinarySearch) {
          startBinarySearch(value);
          setIsBinarySearch(false);
        } else {
          startLinearSearch(value);
        }
      }
    }
  };

  // Performs linear search animation from left to right
  const startLinearSearch = (searchValue) => {
    setCurrentSearchIndex(-1); // Reset to -1 initially
    setFoundNodeId(null);
    setIsAlgorithmRunning(true);

    const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

    const searchStep = (index) => {
      if (index >= sortedNodes.length) {
        // Search complete, no match found
        setIsSearching(false);
        setCurrentSearchIndex(-1);
        setShowNotification(true);
        setIsAlgorithmRunning(false);
        setNextStep(null);
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
        // Match found
        setFoundNodeId(sortedNodes[index].id);
        setIsSearching(false);
        setCurrentSearchIndex(-1);
        setIsAlgorithmRunning(false);
        setNextStep(null);
        return;
      }

      if (enableStepping) {
        // Set up next step function
        setNextStep(() => () => searchStep(index + 1));
      } else {
        // Auto-advance after delay
        setTimeout(() => {
          searchStep(index + 1);
        }, 500);
      }
    };

    // Start the search based on stepping mode
    if (enableStepping) {
      setNextStep(() => () => searchStep(0));
    } else {
      searchStep(0);
    }
  };

  // Handle next step button click
  const handleNextStep = () => {
    if (nextStep) {
      nextStep();
    }
  };

  const startBinarySearch = (searchValue) => {
    setCurrentSearchIndex(-1);
    setFoundNodeId(null);
    setIsAlgorithmRunning(true);

    // Sort nodes by X position
    const sortedNodes = [...nodes].sort((a, b) => a.x - b.x);

    const searchStep = (left, right) => {
      if (left > right) {
        // Search complete, no match found
        setIsSearching(false);
        setCurrentSearchIndex(-1);
        setShowNotification(true);
        setIsAlgorithmRunning(false);
        setNextStep(null);
        setTimeout(() => {
          setShowNotification(false);
        }, 2000);
        return;
      }

      const mid = Math.floor((left + right) / 2);
      const originalIndex = nodes.findIndex(
        (node) => node.id === sortedNodes[mid].id
      );
      setCurrentSearchIndex(originalIndex);

      if (sortedNodes[mid].value === searchValue) {
        // Match found
        setFoundNodeId(sortedNodes[mid].id);
        setIsSearching(false);
        setCurrentSearchIndex(-1);
        setIsAlgorithmRunning(false);
        setNextStep(null);
        return;
      }

      if (enableStepping) {
        // Set up next step function
        // Always divide spatially, regardless of value
        if (mid > Math.floor((left + right) / 2)) {
          setNextStep(() => () => searchStep(left, mid - 1));
        } else {
          setNextStep(() => () => searchStep(mid + 1, right));
        }
      } else {
        // Auto-advance after delay
        setTimeout(() => {
          // Always divide spatially, regardless of value
          if (mid > Math.floor((left + right) / 2)) {
            searchStep(left, mid - 1);
          } else {
            searchStep(mid + 1, right);
          }
        }, 500);
      }
    };

    // Start the search based on stepping mode
    if (enableStepping) {
      setNextStep(() => () => searchStep(0, sortedNodes.length - 1));
    } else {
      searchStep(0, sortedNodes.length - 1);
    }
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
          {isBinarySearch && (
            <div className="search-warning">
              Note: Binary search may not find all values in an unsorted dataset
            </div>
          )}
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
      <div className="stepping-control">
        {isAlgorithmRunning ? (
          <button
            className="next-step-button"
            onClick={handleNextStep}
            disabled={!nextStep}
          >
            Next
          </button>
        ) : (
          <label>
            <input
              type="checkbox"
              checked={enableStepping}
              onChange={(e) => setEnableStepping(e.target.checked)}
            />
            <span>Enable Stepping</span>
          </label>
        )}
      </div>
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
