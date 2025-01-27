export const handleLinearSearchStep = async ({
  currentStep,
  sortedNodes,
  targetValue,
  previousNode,
  d3,
  setPreviousNode,
  setShowNextButton,
  setIsSearching,
  setCurrentStep,
}) => {
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

export const runFullLinearSearch = async ({
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
