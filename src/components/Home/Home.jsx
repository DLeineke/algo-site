import * as d3 from "d3";
import PropTypes from "prop-types";
import { useState } from "react";
import "./Home.css";
import {
  handleBinarySearchStep,
  runFullBinarySearch,
} from "./algorithms/BinarySearch";
import {
  handleBubbleSortStep,
  runFullBubbleSort,
} from "./algorithms/BubbleSort";
import {
  handleLinearSearchStep,
  runFullLinearSearch,
} from "./algorithms/LinearSearch";

const Home = ({ initialNodes }) => {
  const [gridOffset, setGridOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [nodes, setNodes] = useState(initialNodes);
  const [draggedNode, setDraggedNode] = useState(null);
  const [currentButtons, setCurrentButtons] = useState("main");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [enableStepping, setEnableStepping] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [sortedNodes, setSortedNodes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [targetValue, setTargetValue] = useState(null);
  const [previousNode, setPreviousNode] = useState(null);
  const [showBinaryWarning, setShowBinaryWarning] = useState(false);
  const [searchType, setSearchType] = useState("linear");
  const [binaryRange, setBinaryRange] = useState({ left: 0, right: 0 });
  const [isSorting, setIsSorting] = useState(false);
  const [bubbleStep, setBubbleStep] = useState({
    pass: 0,
    position: 0,
    hadSwap: false,
  });
  const [currentOperation, setCurrentOperation] = useState(null);

  const handleLinearSearch = () => {
    setSearchValue("");
    setShowSearchInput(true);
    setSearchType("linear");
    setCurrentOperation("search");
    d3.select(".home-container")
      .append("div")
      .attr("class", "overlay")
      .style("opacity", 0)
      .transition()
      .duration(300)
      .style("opacity", 0.5);
  };

  const handleBinarySearch = () => {
    setSearchValue("");
    setShowSearchInput(true);
    setShowBinaryWarning(true);
    setSearchType("binary");
    setCurrentOperation("search");
    d3.select(".home-container")
      .append("div")
      .attr("class", "overlay")
      .style("opacity", 0)
      .transition()
      .duration(300)
      .style("opacity", 0.5);
  };

  /**
   * Initializes bubble sort by smoothly animating nodes to centered positions.
   */
  const handleBubbleSort = async () => {
    const centerY = window.innerHeight / 2;
    const nodeWidth = 44;
    const spacing = nodeWidth * 2;
    const totalWidth = (nodes.length - 1) * spacing;
    const startX = (window.innerWidth - totalWidth) / 2;

    // Sort nodes by current x position to maintain visual order
    const orderedNodes = [...nodes].sort((a, b) => a.x - b.x);

    // Center all nodes first, maintaining their current order
    await Promise.all(
      orderedNodes.map((node, index) => {
        const newX = startX + index * spacing;

        return new Promise((resolve) => {
          d3.select(`[data-id="${node.id}"]`)
            .transition()
            .duration(1000)
            .style("transform", `translate(${newX}px, ${centerY}px)`)
            .on("end", () => {
              setNodes((prev) => {
                // Update the node being centered
                const updated = prev.map((n) =>
                  n.id === node.id ? { ...n, x: newX, y: centerY } : n
                );
                // Maintain visual order in state
                return updated.sort((a, b) => a.x - b.x);
              });
              resolve();
            });
        });
      })
    );

    setIsSorting(true);
    setBubbleStep({ pass: 0, position: 0, hadSwap: false });
    setShowNextButton(true);
    setCurrentOperation("sort");

    if (!enableStepping) {
      await runFullBubbleSort({
        nodes: orderedNodes,
        d3,
        setNodes,
        setIsSorting,
        setShowNextButton,
        setCurrentOperation,
        startX,
        centerY,
        spacing,
      });
    }
  };

  // Button configurations
  const buttonSets = {
    main: [
      { label: "Search", onClick: () => setCurrentButtons("search") },
      { label: "Sort", onClick: () => setCurrentButtons("sort") },
      { label: "Traverse", onClick: () => setCurrentButtons("traverse") },
    ],
    search: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Linear Search", onClick: handleLinearSearch },
      { label: "Binary Search", onClick: handleBinarySearch },
    ],
    sort: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Bubble Sort", onClick: handleBubbleSort },
      { label: "Quick Sort", onClick: () => {} },
    ],
    traverse: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Pre-order", onClick: () => {} },
      { label: "Post-order", onClick: () => {} },
    ],
  };

  const handleMouseDown = (e) => {
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

  /**
   * Handles mouse movement for both panning and node dragging.
   * Constrains movement within grid boundaries.
   */
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

            // Grid boundaries
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

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setShowSearchInput(false);
      setShowBinaryWarning(false);
      d3.select(".overlay")
        .transition()
        .duration(300)
        .style("opacity", 0)
        .remove();

      if (e.key === "Enter") {
        const searchValue = parseInt(e.target.value);
        const sorted = [...nodes].sort((a, b) => a.x - b.x);
        setTargetValue(searchValue);
        setSortedNodes(sorted);
        setCurrentStep(0);
        setBinaryRange({ left: 0, right: sorted.length - 1 });
        setShowNextButton(true);
        setIsSearching(true);

        if (!enableStepping) {
          if (searchType === "binary") {
            runFullBinarySearch({
              searchValue,
              sortedNodes: sorted,
              d3,
              setShowNextButton,
              setIsSearching,
            });
          } else {
            runFullLinearSearch({
              searchValue,
              sortedNodes: sorted,
              d3,
              setShowNextButton,
              setIsSearching,
            });
          }
        }
      }
    }
  };

  const handleNextStep = async () => {
    if (currentOperation === "search") {
      if (searchType === "binary") {
        await handleBinarySearchStep({
          sortedNodes,
          binaryRange,
          targetValue,
          previousNode,
          d3,
          setPreviousNode,
          setBinaryRange,
          setShowNextButton,
          setIsSearching,
        });
      } else if (searchType === "linear") {
        await handleLinearSearchStep({
          currentStep,
          sortedNodes,
          targetValue,
          previousNode,
          d3,
          setPreviousNode,
          setShowNextButton,
          setIsSearching,
          setCurrentStep,
        });
      }
    } else if (currentOperation === "sort" && isSorting) {
      const centerY = window.innerHeight / 2;
      const nodeWidth = 44;
      const spacing = nodeWidth * 2;
      const totalWidth = (nodes.length - 1) * spacing;
      const startX = (window.innerWidth - totalWidth) / 2;

      await handleBubbleSortStep({
        bubbleStep,
        nodes: [...nodes].sort((a, b) => a.x - b.x),
        d3,
        setNodes,
        setBubbleStep,
        setIsSorting,
        setShowNextButton,
        setCurrentOperation,
        startX,
        centerY,
        spacing,
      });
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
      {showSearchInput && (
        <div className="search-input-container">
          {showBinaryWarning && (
            <div className="binary-warning">
              Binary search will not work properly in an unsorted dataset.
            </div>
          )}
          <input
            type="number"
            className="search-input"
            placeholder="Enter number to search..."
            autoFocus
            onKeyDown={handleSearchSubmit}
            onChange={(e) => setSearchValue(e.target.value)}
            value={searchValue}
          />
        </div>
      )}
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
      <div className="stepping-container">
        {showNextButton ? (
          <button
            className={`next-button ${!enableStepping ? "disabled" : ""}`}
            onClick={handleNextStep}
            disabled={!enableStepping || (!isSearching && !isSorting)}
          >
            Next
          </button>
        ) : (
          <>
            <input
              type="checkbox"
              id="stepping"
              checked={enableStepping}
              onChange={(e) => setEnableStepping(e.target.checked)}
            />
            <label htmlFor="stepping">Enable Stepping</label>
          </>
        )}
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
