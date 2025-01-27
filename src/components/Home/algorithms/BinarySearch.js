export const handleBinarySearchStep = async ({
  sortedNodes,
  binaryRange,
  targetValue,
  previousNode,
  d3,
  setPreviousNode,
  setBinaryRange,
  setShowNextButton,
  setIsSearching,
}) => {
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

export const runFullBinarySearch = async ({
  searchValue,
  sortedNodes,
  d3,
  setShowNextButton,
  setIsSearching,
}) => {
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
