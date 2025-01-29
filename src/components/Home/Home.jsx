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
  const [showAddInput, setShowAddInput] = useState(false);
  const [addNodesValue, setAddNodesValue] = useState("");
  const [addInputError, setAddInputError] = useState("");
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [nodeOverDelete, setNodeOverDelete] = useState(null);

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
            .duration(1000 / animationSpeed)
            .style("transform", `translate(${newX}px, ${centerY}px)`)
            .on("end", () => {
              setNodes((prev) => {
                const updated = prev.map((n) =>
                  n.id === node.id ? { ...n, x: newX, y: centerY } : n
                );
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
        animationSpeed,
      });
    }
  };

  const handleAddNodes = () => {
    setAddNodesValue("");
    setShowAddInput(true);
    setCurrentOperation("add");
    d3.select(".home-container")
      .append("div")
      .attr("class", "overlay")
      .style("opacity", 0)
      .transition()
      .duration(300)
      .style("opacity", 0.5);
  };

  const handleAddNodesSubmit = (e) => {
    if (e.key === "Enter" || e.key === "Escape") {
      if (e.key === "Enter") {
        try {
          const values = e.target.value.split(",");
          const newValues = values.map((num) => {
            const parsed = parseInt(num.trim());
            if (isNaN(parsed)) {
              throw new Error("Please enter only numbers separated by commas");
            }
            return parsed;
          });

          setAddInputError("");
          setShowAddInput(false);
          d3.select(".overlay")
            .transition()
            .duration(300)
            .style("opacity", 0)
            .remove();

          const maxId = Math.max(...nodes.map((n) => n.id), -1);
          const newNodes = newValues.map((value, index) => ({
            id: maxId + 1 + index,
            value,
            x: Math.random() * 500,
            y: 60 + Math.random() * (window.innerHeight - 60),
          }));

          setNodes((prev) => [...prev, ...newNodes]);
        } catch (error) {
          setAddInputError(error.message);
          return;
        }
      } else {
        setAddInputError("");
        setShowAddInput(false);
        d3.select(".overlay")
          .transition()
          .duration(300)
          .style("opacity", 0)
          .remove();
      }
    }
  };

  // Button configurations
  const buttonSets = {
    main: [
      { label: "Search", onClick: () => setCurrentButtons("search") },
      { label: "Sort", onClick: () => setCurrentButtons("sort") },
      { label: "Add Node(s)", onClick: handleAddNodes },
      { label: "Tree Mode", onClick: () => {} },
    ],
    search: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Linear Search", onClick: handleLinearSearch },
      { label: "Binary Search", onClick: handleBinarySearch },
    ],
    sort: [
      { label: "Back", onClick: () => setCurrentButtons("main") },
      { label: "Selection Sort", onClick: () => {} },
      { label: "Bubble Sort", onClick: handleBubbleSort },
      { label: "Insertion Sort", onClick: () => {} },
    ],
  };

  const handleMouseDown = (e) => {
    if (isSearching || isSorting) {
      return;
    }

    if (e.target.classList.contains("node")) {
      const nodeId = Number(e.target.dataset.id);
      setDraggedNode(nodeId);
    } else {
      setIsPanning(true);
    }
  };

  const handleMouseUp = () => {
    if (draggedNode !== null && nodeOverDelete === draggedNode) {
      // Remove the node
      setNodes((prev) => prev.filter((node) => node.id !== draggedNode));

      // Reset states
      setNodeOverDelete(null);
    }

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
        animationSpeed,
      });
    }
  };

  const handleNodeMouseMove = (e, nodeId) => {
    // Only check for delete when dragging and not during operations
    if (draggedNode === nodeId && !isSearching && !isSorting) {
      const deleteButton = document.querySelector(".delete-button");
      if (deleteButton) {
        const buttonRect = deleteButton.getBoundingClientRect();
        const nodeRect = e.currentTarget.getBoundingClientRect();

        const nodeCenterX = nodeRect.left + nodeRect.width / 2;
        const nodeCenterY = nodeRect.top + nodeRect.height / 2;

        const isOver =
          nodeCenterX >= buttonRect.left &&
          nodeCenterX <= buttonRect.right &&
          nodeCenterY >= buttonRect.top &&
          nodeCenterY <= buttonRect.bottom;

        setNodeOverDelete(isOver ? nodeId : null);
      }
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
      {showAddInput && (
        <div className="search-input-container">
          {addInputError && <div className="input-error">{addInputError}</div>}
          <input
            type="text"
            className="search-input"
            placeholder="Enter comma-separated numbers..."
            autoFocus
            onKeyDown={handleAddNodesSubmit}
            onChange={(e) => setAddNodesValue(e.target.value)}
            value={addNodesValue}
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
            className={`node ${
              nodeOverDelete === node.id ? "delete-hover" : ""
            } ${isSearching || isSorting ? "operation-active" : ""}`}
            data-id={node.id}
            style={{
              transform: `translate(${node.x}px, ${node.y}px)`,
            }}
            onMouseMove={(e) => handleNodeMouseMove(e, node.id)}
            onMouseLeave={() => setNodeOverDelete(null)}
          >
            {node.value}
          </div>
        ))}
      </div>
      <button
        className={`delete-button ${nodeOverDelete !== null ? "active" : ""}`}
      >
        Delete
      </button>
      <div className="controls-container">
        <div className="speed-control">
          <label htmlFor="speed">Animation Speed:</label>
          <select
            id="speed"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
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
