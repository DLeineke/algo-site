import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import "./Welcome.css";

const Welcome = () => {
  const svgRef = useRef();
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

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

  return (
    <div className="welcome-container">
      <svg ref={svgRef} width="100%" height="100vh"></svg>
      {showInput && (
        <div className="input-container">
          <input
            type="text"
            className="data-input"
            placeholder="Enter comma-separated numbers..."
          />
        </div>
      )}
    </div>
  );
};

export default Welcome;
