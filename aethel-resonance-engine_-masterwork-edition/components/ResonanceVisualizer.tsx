
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Props {
  score: number;
  modality: string;
}

const ResonanceVisualizer: React.FC<Props> = ({ score, modality }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;

    const colorMap: Record<string, string> = {
      perfect: "#0ea5e9",
      stable: "#10b981",
      volatile: "#f59e0b",
      void: "#64748b",
    };
    const activeColor = colorMap[modality] || colorMap.stable;

    const g = svg.append("g");

    // Defs for gradients
    const defs = svg.append("defs");
    const radialGradient = defs.append("radialGradient")
      .attr("id", "main-glow")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    radialGradient.append("stop").attr("offset", "0%").attr("stop-color", activeColor).attr("stop-opacity", 0.8);
    radialGradient.append("stop").attr("offset", "100%").attr("stop-color", activeColor).attr("stop-opacity", 0);

    // Particle field
    const particles = d3.range(20).map(() => ({
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 40,
      speed: 0.01 + Math.random() * 0.02,
      size: 1 + Math.random() * 2
    }));

    const particleG = g.append("g");
    const renderParticles = () => {
      particleG.selectAll("circle").remove();
      particles.forEach(p => {
        p.angle += p.speed;
        const x = centerX + Math.cos(p.angle) * p.radius;
        const y = centerY + Math.sin(p.angle) * p.radius;
        particleG.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", p.size)
          .attr("fill", activeColor)
          .attr("opacity", 0.6);
      });
    };

    const timer = d3.timer(renderParticles);

    // Core Visuals
    g.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 150)
      .attr("fill", "url(#main-glow)")
      .attr("opacity", (score / 100) * 0.4);

    // XNOR Circles (Representing Sets)
    const offset = 60 - (score / 100) * 60; // Pull closer as resonance increases
    const circleRadius = 90;

    g.append("circle")
      .attr("cx", centerX - offset)
      .attr("cy", centerY)
      .attr("r", circleRadius)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.2);

    g.append("circle")
      .attr("cx", centerX + offset)
      .attr("cy", centerY)
      .attr("r", circleRadius)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.2);

    // Central Score
    const textG = g.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    
    textG.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "white")
      .attr("class", "mono font-bold text-4xl")
      .style("text-shadow", "0 0 10px rgba(255,255,255,0.5)")
      .text(`${score}%`);

    textG.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "2.5em")
      .attr("fill", activeColor)
      .attr("class", "text-[10px] uppercase tracking-[0.4em] font-black")
      .text(modality);

    return () => timer.stop();
  }, [score, modality]);

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full scale-75 animate-pulse" />
      <svg ref={svgRef} width="400" height="400" className="max-w-full h-auto resonance-glow relative z-10" />
    </div>
  );
};

export default ResonanceVisualizer;
