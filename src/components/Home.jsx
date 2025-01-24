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
  const [isSorting, setIsSorting] = useState(false);
  const [bubbleStep, setBubbleStep] = useState({ pass: 0, position: 0 });
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
   * Handles a single step of the bubble sort when stepping is enabled.
   * Returns true if sorting is complete, false if more steps remain.
   */
  const handleBubbleSortStep = async () => {
    const { pass, position } = bubbleStep;
    const nodeArray = [...nodes].sort((a, b) => a.x - b.x);
    const pair = [nodeArray[position], nodeArray[position + 1]];

    // Highlight current pair
    await Promise.all(
      pair.map((node) =>
        d3
          .select(`[data-id="${node.id}"]`)
          .transition()
          .duration(300)
          .style("background-color", "#4caf50")
          .end()
      )
    );

    // Check if swap needed
    if (pair[0].value > pair[1].value) {
      const leftX = pair[0].x;
      const rightX = pair[1].x;

      // Animate swap
      await Promise.all([
        new Promise((resolve) => {
          d3.select(`[data-id="${pair[0].id}"]`)
            .transition()
            .duration(600)
            .style("transform", `translate(${rightX}px, ${pair[0].y}px)`)
            .on("end", resolve);
        }),
        new Promise((resolve) => {
          d3.select(`[data-id="${pair[1].id}"]`)
            .transition()
            .duration(600)
            .style("transform", `translate(${leftX}px, ${pair[1].y}px)`)
            .on("end", resolve);
        }),
      ]);

      // Update positions in state
      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === pair[0].id) return { ...n, x: rightX };
          if (n.id === pair[1].id) return { ...n, x: leftX };
          return n;
        })
      );
    }

    // Reset highlight
    await Promise.all(
      pair.map((node) =>
        d3
          .select(`[data-id="${node.id}"]`)
          .transition()
          .duration(300)
          .style("background-color", "white")
          .end()
      )
    );

    // Update step state
    if (position >= nodeArray.length - 2) {
      if (pass >= nodeArray.length - 2) {
        // Sorting complete
        d3.select(".home-container")
          .append("div")
          .attr("class", "search-result")
          .style("opacity", 0)
          .text("Sorting complete!")
          .transition()
          .duration(300)
          .style("opacity", 1)
          .transition()
          .delay(1400)
          .duration(300)
          .style("opacity", 0)
          .remove();

        setIsSorting(false);
        setBubbleStep({ pass: 0, position: 0 });
        setShowNextButton(false);
        setCurrentOperation(null);
        return true;
      }
      setBubbleStep({ pass: pass + 1, position: 0 });
    } else {
      setBubbleStep({ ...bubbleStep, position: position + 1 });
    }
    return false;
  };

  /**
   * Initializes bubble sort by smoothly animating nodes to centered positions,
   * then begins the pair-wise comparison and swapping animation.
   * Continues until no swaps are needed in a full pass.
   */
  const handleBubbleSort = async () => {
    const sortedByX = [...nodes].sort((a, b) => a.x - b.x);
    const centerY = window.innerHeight / 2;
    const nodeWidth = 44;
    const spacing = nodeWidth * 2;

    const totalWidth = (sortedByX.length - 1) * spacing;
    const startX = (window.innerWidth - totalWidth) / 2;

    // Center all nodes first
    await Promise.all(
      sortedByX.map((node, index) => {
        const newX = startX + index * spacing;

        return new Promise((resolve) => {
          d3.select(`[data-id="${node.id}"]`)
            .transition()
            .duration(1000)
            .style("transform", `translate(${newX}px, ${centerY}px)`)
            .on("end", () => {
              setNodes((prev) =>
                prev.map((n) =>
                  n.id === node.id ? { ...n, x: newX, y: centerY } : n
                )
              );
              resolve();
            });
        });
      })
    );

    setIsSorting(true);
    setBubbleStep({ pass: 0, position: 0 });
    setShowNextButton(true);
    setCurrentOperation("sort");

    if (!enableStepping) {
      // Run full animation
      let swapped;
      do {
        swapped = false;
        const nodeArray = [...sortedByX];
        for (let i = 0; i < nodeArray.length - 1; i++) {
          const pair = [nodeArray[i], nodeArray[i + 1]];

          // Highlight current pair
          await Promise.all(
            pair.map((node) =>
              d3
                .select(`[data-id="${node.id}"]`)
                .transition()
                .duration(300)
                .style("background-color", "#4caf50")
                .end()
            )
          );

          if (pair[0].value > pair[1].value) {
            swapped = true;
            const leftX = nodeArray[i].x;
            const rightX = nodeArray[i + 1].x;

            // Animate the swap
            await Promise.all([
              new Promise((resolve) => {
                d3.select(`[data-id="${pair[0].id}"]`)
                  .transition()
                  .duration(600)
                  .style("transform", `translate(${rightX}px, ${pair[0].y}px)`)
                  .on("end", resolve);
              }),
              new Promise((resolve) => {
                d3.select(`[data-id="${pair[1].id}"]`)
                  .transition()
                  .duration(600)
                  .style("transform", `translate(${leftX}px, ${pair[1].y}px)`)
                  .on("end", resolve);
              }),
            ]);

            // Update positions in state
            setNodes((prev) =>
              prev.map((n) => {
                if (n.id === pair[0].id) return { ...n, x: rightX };
                if (n.id === pair[1].id) return { ...n, x: leftX };
                return n;
              })
            );

            // Update array for next iteration
            [nodeArray[i], nodeArray[i + 1]] = [nodeArray[i + 1], nodeArray[i]];
          }

          // Reset highlight
          await Promise.all(
            pair.map((node) =>
              d3
                .select(`[data-id="${node.id}"]`)
                .transition()
                .duration(300)
                .style("background-color", "white")
                .end()
            )
          );

          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      } while (swapped);
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
            runFullBinarySearch(searchValue, sorted);
          } else {
            runFullSearch(searchValue, sorted);
          }
        }
      }
    }
  };

  const handleNextStep = async () => {
    if (currentOperation === "search") {
      if (searchType === "binary") {
        await handleBinarySearchStep();
      } else if (searchType === "linear") {
        await handleLinearSearchStep();
      }
    } else if (currentOperation === "sort" && isSorting) {
      await handleBubbleSortStep();
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
