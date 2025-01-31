export const runFullSelectionSort = async ({
  nodes,
  d3,
  setNodes,
  setIsSorting,
  setShowNextButton,
  setCurrentOperation,
  startX,
  centerY,
  spacing,
  animationSpeed,
}) => {
  let nodeArray = [...nodes].sort((a, b) => a.x - b.x);

  // First, ensure all nodes are properly positioned
  nodeArray = nodeArray.map((node, index) => ({
    ...node,
    x: startX + index * spacing,
    y: centerY,
  }));

  for (let i = 0; i < nodeArray.length - 1; i++) {
    let minIndex = i;

    // Highlight current minimum
    await d3
      .select(`[data-id="${nodeArray[minIndex].id}"]`)
      .transition()
      .duration(300 / animationSpeed)
      .style("background-color", "#add8e6")
      .end();

    // Find minimum in unsorted portion
    for (let j = i + 1; j < nodeArray.length; j++) {
      // Highlight node being compared
      await d3
        .select(`[data-id="${nodeArray[j].id}"]`)
        .transition()
        .duration(300 / animationSpeed)
        .style("background-color", "#4caf50")
        .end();

      if (nodeArray[j].value < nodeArray[minIndex].value) {
        // Reset previous minimum
        await d3
          .select(`[data-id="${nodeArray[minIndex].id}"]`)
          .transition()
          .duration(300 / animationSpeed)
          .style("background-color", "white")
          .end();

        minIndex = j;
        // Highlight new minimum
        await d3
          .select(`[data-id="${nodeArray[minIndex].id}"]`)
          .transition()
          .duration(300 / animationSpeed)
          .style("background-color", "#add8e6")
          .end();
      } else {
        // Reset compared node if not minimum
        await d3
          .select(`[data-id="${nodeArray[j].id}"]`)
          .transition()
          .duration(300 / animationSpeed)
          .style("background-color", "white")
          .end();
      }
    }

    if (minIndex !== i) {
      // Change minimum to green before swap
      await d3
        .select(`[data-id="${nodeArray[minIndex].id}"]`)
        .transition()
        .duration(300 / animationSpeed)
        .style("background-color", "#4caf50")
        .end();

      // Update positions in array first
      const temp = nodeArray[i];
      nodeArray[i] = nodeArray[minIndex];
      nodeArray[minIndex] = temp;

      // Update x positions
      nodeArray[i].x = startX + i * spacing;
      nodeArray[minIndex].x = startX + minIndex * spacing;

      // Animate swap
      await Promise.all([
        new Promise((resolve) => {
          d3.select(`[data-id="${nodeArray[i].id}"]`)
            .transition()
            .duration(600 / animationSpeed)
            .style("transform", `translate(${nodeArray[i].x}px, ${centerY}px)`)
            .on("end", resolve);
        }),
        new Promise((resolve) => {
          d3.select(`[data-id="${nodeArray[minIndex].id}"]`)
            .transition()
            .duration(600 / animationSpeed)
            .style(
              "transform",
              `translate(${nodeArray[minIndex].x}px, ${centerY}px)`
            )
            .on("end", resolve);
        }),
      ]);

      // Update state with new positions
      setNodes([...nodeArray]);
    }

    // Reset colors after swap
    await Promise.all([
      d3
        .select(`[data-id="${nodeArray[i].id}"]`)
        .transition()
        .duration(300 / animationSpeed)
        .style("background-color", "white")
        .end(),
      minIndex !== i
        ? d3
            .select(`[data-id="${nodeArray[minIndex].id}"]`)
            .transition()
            .duration(300 / animationSpeed)
            .style("background-color", "white")
            .end()
        : Promise.resolve(),
    ]);
  }

  // Show completion message
  d3.select(".home-container")
    .append("div")
    .attr("class", "search-result")
    .style("opacity", 0)
    .text("Sorting complete!")
    .transition()
    .duration(300 / animationSpeed)
    .style("opacity", 1)
    .transition()
    .delay(1400 / animationSpeed)
    .duration(300 / animationSpeed)
    .style("opacity", 0)
    .remove();

  setIsSorting(false);
  setShowNextButton(false);
  setCurrentOperation(null);
};

export const handleSelectionSortStep = async ({
  selectionStep,
  nodes,
  d3,
  setNodes,
  setSelectionStep,
  setIsSorting,
  setShowNextButton,
  setCurrentOperation,
  startX,
  centerY,
  spacing,
  animationSpeed,
}) => {
  const { currentIndex, scanIndex, minIndex } = selectionStep;
  const nodeArray = [...nodes].sort((a, b) => a.x - b.x);

  // If starting a new scan
  if (scanIndex === currentIndex) {
    // Highlight current minimum
    await d3
      .select(`[data-id="${nodeArray[currentIndex].id}"]`)
      .transition()
      .duration(300 / animationSpeed)
      .style("background-color", "#add8e6")
      .end();

    setSelectionStep((prev) => ({
      ...prev,
      minIndex: currentIndex,
      scanIndex: currentIndex + 1,
    }));
    return false;
  }

  // During scanning
  if (scanIndex < nodeArray.length) {
    // Highlight node being compared
    await d3
      .select(`[data-id="${nodeArray[scanIndex].id}"]`)
      .transition()
      .duration(300 / animationSpeed)
      .style("background-color", "#4caf50")
      .end();

    if (nodeArray[scanIndex].value < nodeArray[minIndex].value) {
      // Reset previous minimum
      await d3
        .select(`[data-id="${nodeArray[minIndex].id}"]`)
        .transition()
        .duration(300 / animationSpeed)
        .style("background-color", "white")
        .end();

      // Highlight new minimum
      await d3
        .select(`[data-id="${nodeArray[scanIndex].id}"]`)
        .transition()
        .duration(300 / animationSpeed)
        .style("background-color", "#add8e6")
        .end();

      setSelectionStep((prev) => ({
        ...prev,
        minIndex: scanIndex,
        scanIndex: scanIndex + 1,
      }));
    } else {
      // Reset compared node if not minimum
      await d3
        .select(`[data-id="${nodeArray[scanIndex].id}"]`)
        .transition()
        .duration(300 / animationSpeed)
        .style("background-color", "white")
        .end();

      setSelectionStep((prev) => ({
        ...prev,
        scanIndex: scanIndex + 1,
      }));
    }
    return false;
  }

  // End of scan, perform swap if needed
  if (minIndex !== currentIndex) {
    // Change minimum to green before swap
    await d3
      .select(`[data-id="${nodeArray[minIndex].id}"]`)
      .transition()
      .duration(300 / animationSpeed)
      .style("background-color", "#4caf50")
      .end();

    // Update positions in array
    const temp = nodeArray[currentIndex];
    nodeArray[currentIndex] = nodeArray[minIndex];
    nodeArray[minIndex] = temp;

    // Update x positions
    nodeArray[currentIndex].x = startX + currentIndex * spacing;
    nodeArray[minIndex].x = startX + minIndex * spacing;

    // Animate swap
    await Promise.all([
      new Promise((resolve) => {
        d3.select(`[data-id="${nodeArray[currentIndex].id}"]`)
          .transition()
          .duration(600 / animationSpeed)
          .style(
            "transform",
            `translate(${nodeArray[currentIndex].x}px, ${centerY}px)`
          )
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        d3.select(`[data-id="${nodeArray[minIndex].id}"]`)
          .transition()
          .duration(600 / animationSpeed)
          .style(
            "transform",
            `translate(${nodeArray[minIndex].x}px, ${centerY}px)`
          )
          .on("end", resolve);
      }),
    ]);

    // Update state with new positions
    setNodes([...nodeArray]);
  }

  // Reset colors
  await Promise.all([
    d3
      .select(`[data-id="${nodeArray[currentIndex].id}"]`)
      .transition()
      .duration(300 / animationSpeed)
      .style("background-color", "white")
      .end(),
    minIndex !== currentIndex
      ? d3
          .select(`[data-id="${nodeArray[minIndex].id}"]`)
          .transition()
          .duration(300 / animationSpeed)
          .style("background-color", "white")
          .end()
      : Promise.resolve(),
  ]);

  // Check if sorting is complete
  if (currentIndex >= nodeArray.length - 1) {
    d3.select(".home-container")
      .append("div")
      .attr("class", "search-result")
      .style("opacity", 0)
      .text("Sorting complete!")
      .transition()
      .duration(300 / animationSpeed)
      .style("opacity", 1)
      .transition()
      .delay(1400 / animationSpeed)
      .duration(300 / animationSpeed)
      .style("opacity", 0)
      .remove();

    setIsSorting(false);
    setShowNextButton(false);
    setCurrentOperation(null);
    return true;
  }

  // Move to next position
  setSelectionStep({
    currentIndex: currentIndex + 1,
    scanIndex: currentIndex + 1,
    minIndex: currentIndex + 1,
  });
  return false;
};
