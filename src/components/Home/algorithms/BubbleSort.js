export const handleBubbleSortStep = async ({
  bubbleStep,
  nodes,
  d3,
  setNodes,
  setBubbleStep,
  setIsSorting,
  setShowNextButton,
  setCurrentOperation,
  startX,
  centerY,
  spacing,
}) => {
  const { pass, position, hadSwap } = bubbleStep;
  // Use nodes directly without sorting by x position
  const pair = [nodes[position], nodes[position + 1]];

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
    const leftX = startX + position * spacing;
    const rightX = startX + (position + 1) * spacing;

    // Animate swap
    await Promise.all([
      new Promise((resolve) => {
        d3.select(`[data-id="${pair[0].id}"]`)
          .transition()
          .duration(600)
          .style("transform", `translate(${rightX}px, ${centerY}px)`)
          .on("end", resolve);
      }),
      new Promise((resolve) => {
        d3.select(`[data-id="${pair[1].id}"]`)
          .transition()
          .duration(600)
          .style("transform", `translate(${leftX}px, ${centerY}px)`)
          .on("end", resolve);
      }),
    ]);

    // Update positions in state and swap nodes in array
    setNodes((prev) => {
      const newNodes = [...prev];
      // Swap nodes in the array
      [newNodes[position], newNodes[position + 1]] = [
        newNodes[position + 1],
        newNodes[position],
      ];
      // Update positions
      newNodes[position] = { ...newNodes[position], x: leftX };
      newNodes[position + 1] = { ...newNodes[position + 1], x: rightX };
      return newNodes;
    });

    setBubbleStep((prev) => ({ ...prev, hadSwap: true }));
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
  if (position >= nodes.length - 2) {
    // End of pass - if no swaps occurred, array is sorted
    if (!hadSwap) {
      // No swaps in this pass - array is sorted
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
      setBubbleStep({ pass: 0, position: 0, hadSwap: false });
      setShowNextButton(false);
      setCurrentOperation(null);
      return true;
    }
    // Start new pass, reset hadSwap
    setBubbleStep({ pass: pass + 1, position: 0, hadSwap: false });
  } else {
    // Continue current pass, maintain hadSwap state
    setBubbleStep((prev) => ({ ...prev, position: position + 1 }));
  }
  return false;
};

export const runFullBubbleSort = async ({
  nodes,
  d3,
  setNodes,
  setIsSorting,
  setShowNextButton,
  setCurrentOperation,
}) => {
  const centerY = window.innerHeight / 2;
  const nodeWidth = 44;
  const spacing = nodeWidth * 2;
  const totalWidth = (nodes.length - 1) * spacing;
  const startX = (window.innerWidth - totalWidth) / 2;

  let swapped;
  const nodeArray = [...nodes].sort((a, b) => a.x - b.x);

  do {
    swapped = false;

    for (let i = 0; i < nodeArray.length - 1; i++) {
      const pair = [nodeArray[i], nodeArray[i + 1]];

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
        const leftX = startX + i * spacing;
        const rightX = startX + (i + 1) * spacing;

        await Promise.all([
          new Promise((resolve) => {
            d3.select(`[data-id="${pair[0].id}"]`)
              .transition()
              .duration(600)
              .style("transform", `translate(${rightX}px, ${centerY}px)`)
              .on("end", resolve);
          }),
          new Promise((resolve) => {
            d3.select(`[data-id="${pair[1].id}"]`)
              .transition()
              .duration(600)
              .style("transform", `translate(${leftX}px, ${centerY}px)`)
              .on("end", resolve);
          }),
        ]);

        setNodes((prev) =>
          prev.map((n) => {
            if (n.id === pair[0].id) return { ...n, x: rightX };
            if (n.id === pair[1].id) return { ...n, x: leftX };
            return n;
          })
        );

        [nodeArray[i], nodeArray[i + 1]] = [nodeArray[i + 1], nodeArray[i]];
      }

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
    }
  } while (swapped);

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
  setShowNextButton(false);
  setCurrentOperation(null);
};
