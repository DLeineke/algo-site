import * as d3 from "d3";
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { useEffect, useRef, useState } from "react";
import "./Welcome.css";

const Welcome = () => {
  const svgRef = useRef();
  const [showInput, setShowInput] = useState(false);
  const [inputData, setInputData] = useState("");

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Set up dimensions
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Create nodes and links data
    const nodes = d3.range(100).map(() => ({}));
    const links = d3.range(200).map(() => ({
      source: Math.floor(Math.random() * nodes.length),
      target: Math.floor(Math.random() * nodes.length),
    }));

    // Create a force simulation
    forceSimulation(nodes)
      .force("link", forceLink(links).distance(500))
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(width / 2, height / 2))
      .on("tick", ticked);

    // Create link elements
    const link = svg
      .append("g")
      .attr("stroke", "#ddd")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line");

    // Create node elements
    const node = svg
      .append("g")
      .attr("fill", "#eee")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5);

    // Update positions on each tick
    function ticked() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    }

    // Initial Welcome text
    const welcomeText = svg
      .append("text")
      .attr("x", "50%")
      .attr("y", "50%")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "48px")
      .style("font-weight", "bold")
      .style("opacity", 0)
      .text("Welcome!");

    // Data prompt text (initially hidden)
    const promptText = svg
      .append("text")
      .attr("x", "50%")
      .attr("y", "40%")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "24px")
      .style("opacity", 0)
      .text("First thing's first, we need some data...");

    // Initial welcome text fade in
    welcomeText
      .transition()
      .duration(1500)
      .style("opacity", 1)
      .on("end", () => {
        setTimeout(() => {
          welcomeText
            .transition()
            .duration(500)
            .attr("y", "40%")
            .style("opacity", 0)
            .on("end", () => {
              promptText
                .transition()
                .duration(1000)
                .style("opacity", 1)
                .on("end", () => {
                  setShowInput(true);
                });
            });
        }, 1000);
      });
  }, []);

  const handleButtonClick = () => {
    console.log("Button clicked with data:", inputData);
    // Add any additional logic for button click here
  };

  return (
    <div className="welcome-container">
      <svg ref={svgRef} width="100%" height="100vh"></svg>
      {showInput && (
        <div className="input-container">
          <input
            type="text"
            className="data-input"
            placeholder="Enter comma-separated numbers..."
            onChange={(e) => setInputData(e.target.value)}
          />
          <button onClick={handleButtonClick} className="submit-button">
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default Welcome;
