import * as d3 from "d3";
import PropTypes from "prop-types";
import { useState } from "react";
import "./Home.css";

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

  const handleLinearSearch = () => {
    setSearchValue("");
    setShowSearchInput(true);
    setSearchType("linear");
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
    d3.select(".home-container")
      .append("div")
      .attr("class", "overlay")
      .style("opacity", 0)
      .transition()
      .duration(300)
      .style("opacity", 0.5);
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
      { label: "Bubble Sort", onClick: () => {} },
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
            runFullBinarySearch(searchValue, sorted);
          } else {
            runFullSearch(searchValue, sorted);
          }
        }
      }
    }
  };

  const handleNextStep = async () => {
    if (searchType === "binary") {
      await handleBinarySearchStep();
    } else {
      await handleLinearSearchStep();
    }
  };

  /**
   * Handles the binary search algorithm step by step.
   * Highlights the current node, updates search range, and shows completion animations.
   * Uses the midpoint of the current range to determine the next search direction.
   */
  const handleBinarySearchStep = async () => {
    const mid = Math.floor((binaryRange.left + binaryRange.right) / 2);
    const node = sortedNodes[mid];

    if (previousNode) {
      d3.select(`[data-id="${previousNode.id}"]`)
        .transition()
        .duration(300)
        .style("background-color", "white");
    }

    await d3
      .select(`[data-id="${node.id}"]`)
      .transition()
      .duration(300)
      .style("background-color", "#4caf50");

    setPreviousNode(node);

    if (node.value === targetValue) {
      setPreviousNode(null);
      const foundNode = d3.select(`[data-id="${node.id}"]`);
      const resultText = d3
        .select(".home-container")
        .append("div")
        .attr("class", "search-result")
        .style("opacity", 1)
        .text(`Node ${targetValue} found`);

      const blinkInterval = setInterval(async () => {
        await foundNode
          .transition()
          .duration(300)
          .style("background-color", "#ffd700")
          .transition()
          .duration(300)
          .style("background-color", "white")
          .end();
      }, 600);

      setTimeout(() => {
        clearInterval(blinkInterval);
        resultText.transition().duration(500).style("opacity", 0).remove();
        setShowNextButton(false);
        setIsSearching(false);
      }, 2000);

      return;
    }

    if (binaryRange.left >= binaryRange.right) {
      setPreviousNode(null);
      const resultText = d3
        .select(".home-container")
        .append("div")
        .attr("class", "search-result")
        .style("opacity", 1)
        .text(`Node ${targetValue} not found`);

      setTimeout(() => {
        resultText.transition().duration(500).style("opacity", 0).remove();
        setShowNextButton(false);
        setIsSearching(false);
      }, 2000);
      return;
    }

    if (node.value < targetValue) {
      setBinaryRange({ ...binaryRange, left: mid + 1 });
    } else {
      setBinaryRange({ ...binaryRange, right: mid - 1 });
    }
  };

  /**
   * Handles the linear search algorithm step by step.
   * Sequentially checks each node from left to right.
   * Highlights current node and shows completion animations.
   */
  const handleLinearSearchStep = async () => {
    if (currentStep < sortedNodes.length) {
      const node = sortedNodes[currentStep];

      if (previousNode) {
        d3.select(`[data-id="${previousNode.id}"]`)
          .transition()
          .duration(300)
          .style("background-color", "white");
      }

      await d3
        .select(`[data-id="${node.id}"]`)
        .transition()
        .duration(300)
        .style("background-color", "#4caf50");

      setPreviousNode(node);

      if (node.value === targetValue) {
        setPreviousNode(null);
        const foundNode = d3.select(`[data-id="${node.id}"]`);
        const resultText = d3
          .select(".home-container")
          .append("div")
          .attr("class", "search-result")
          .style("opacity", 1)
          .text(`Node ${targetValue} found`);

        const blinkInterval = setInterval(async () => {
          await foundNode
            .transition()
            .duration(300)
            .style("background-color", "#ffd700")
            .transition()
            .duration(300)
            .style("background-color", "white")
            .end();
        }, 600);

        setTimeout(() => {
          clearInterval(blinkInterval);
          resultText.transition().duration(500).style("opacity", 0).remove();
          setShowNextButton(false);
          setIsSearching(false);
        }, 2000);

        return;
      }

      if (currentStep === sortedNodes.length - 1) {
        setPreviousNode(null);
        const resultText = d3
          .select(".home-container")
          .append("div")
          .attr("class", "search-result")
          .style("opacity", 1)
          .text(`Node ${targetValue} not found`);

        setTimeout(() => {
          resultText.transition().duration(500).style("opacity", 0).remove();
          setShowNextButton(false);
          setIsSearching(false);
        }, 2000);
      }

      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Executes a full linear search without stepping.
   * Animates through all nodes sequentially until target is found or end is reached.
   */
  const runFullSearch = async (searchValue, sortedNodes) => {
    const resultText = d3
      .select(".home-container")
      .append("div")
      .attr("class", "search-result")
      .style("opacity", 0)
      .text("Searching...");

    for (let i = 0; i < sortedNodes.length; i++) {
      const node = sortedNodes[i];

      await d3
        .select(`[data-id="${node.id}"]`)
        .transition()
        .duration(300)
        .style("background-color", "#4caf50")
        .transition()
        .duration(300)
        .style("background-color", "white")
        .end();

      if (node.value === searchValue) {
        // Found the value
        const foundNode = d3.select(`[data-id="${node.id}"]`);
        resultText.style("opacity", 1).text(`Node ${searchValue} found`);

        const blinkInterval = setInterval(async () => {
          await foundNode
            .transition()
            .duration(300)
            .style("background-color", "#ffd700")
            .transition()
            .duration(300)
            .style("background-color", "white")
            .end();
        }, 600);

        setTimeout(() => {
          clearInterval(blinkInterval);
          resultText.transition().duration(500).style("opacity", 0).remove();
          setShowNextButton(false);
          setIsSearching(false);
        }, 2000);

        return;
      }

      if (i === sortedNodes.length - 1) {
        // Not found
        resultText
          .style("opacity", 1)
          .text(`Node ${searchValue} not found`)
          .transition()
          .delay(2000)
          .duration(500)
          .style("opacity", 0)
          .remove()
          .on("end", () => {
            setShowNextButton(false);
            setIsSearching(false);
          });
      }
    }
  };

  /**
   * Executes a full binary search without stepping.
   * Animates through nodes using binary search algorithm until target is found or range is empty.
   */
  const runFullBinarySearch = async (searchValue, sortedNodes) => {
    const resultText = d3
      .select(".home-container")
      .append("div")
      .attr("class", "search-result")
      .style("opacity", 0)
      .text("Searching...");

    let left = 0;
    let right = sortedNodes.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const node = sortedNodes[mid];

      // Highlight current node
      await d3
        .select(`[data-id="${node.id}"]`)
        .transition()
        .duration(300)
        .style("background-color", "#4caf50")
        .transition()
        .duration(300)
        .style("background-color", "white")
        .end();

      if (node.value === searchValue) {
        // Found value
        const foundNode = d3.select(`[data-id="${node.id}"]`);
        resultText.style("opacity", 1).text(`Node ${searchValue} found`);

        const blinkInterval = setInterval(async () => {
          await foundNode
            .transition()
            .duration(300)
            .style("background-color", "#ffd700")
            .transition()
            .duration(300)
            .style("background-color", "white")
            .end();
        }, 600);

        setTimeout(() => {
          clearInterval(blinkInterval);
          resultText.transition().duration(500).style("opacity", 0).remove();
          setShowNextButton(false);
          setIsSearching(false);
        }, 2000);

        return;
      }

      if (node.value < searchValue) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }

      if (left > right) {
        // Not found
        resultText
          .style("opacity", 1)
          .text(`Node ${searchValue} not found`)
          .transition()
          .delay(2000)
          .duration(500)
          .style("opacity", 0)
          .remove()
          .on("end", () => {
            setShowNextButton(false);
            setIsSearching(false);
          });
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
            disabled={!enableStepping || !isSearching}
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
