"use client";

import React, { useEffect, useRef } from "react";

export default function SynergyLoader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sync size
    const syncSize = () => {
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 300;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    // Use alpha: true to support transparent background
    const gl = canvas.getContext("webgl", { alpha: true }) || canvas.getContext("experimental-webgl", { alpha: true }) as WebGLRenderingContext;
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      void main() {
          vec2 uv = v_texCoord;
          vec2 center = vec2(0.5, 0.5);
          float aspect = u_resolution.x / u_resolution.y;
          uv.x *= aspect;
          center.x *= aspect;

          // Sinerji Colors
          vec3 colorGreen = vec3(0.0, 0.302, 0.251); // #004d40
          vec3 colorOrange = vec3(0.886, 0.529, 0.263); // #e28743

          // Orbiting parameters
          float radius = 0.15;
          float speed = u_time * 2.5;
          
          // Position of Orb 1 (Green)
          vec2 pos1 = center + vec2(cos(speed), sin(speed)) * radius;
          // Position of Orb 2 (Orange)
          vec2 pos2 = center + vec2(cos(speed + 3.14159), sin(speed + 3.14159)) * radius;

          // Metaball influence
          float d1 = 0.04 / distance(uv, pos1);
          float d2 = 0.04 / distance(uv, pos2);
          
          // Pulse effect
          float pulse = 1.0 + 0.1 * sin(u_time * 4.0);
          d1 *= pulse;
          d2 *= pulse;

          float combined = d1 + d2;
          
          // Sharp edge with smoothstep
          float mask = smoothstep(0.48, 0.52, combined);
          
          // Color blending based on proximity
          float blend = clamp(d2 / (d1 + d2 + 0.001), 0.0, 1.0);
          vec3 orbColor = mix(colorGreen, colorOrange, blend);
          
          // Glowing aura
          float glow = smoothstep(0.2, 0.5, combined) * 0.4;
          
          // Calculate alpha transparency so background shines through
          float alpha = clamp(mask + glow * (1.0 - mask), 0.0, 1.0);

          gl_FragColor = vec4(orbColor, alpha);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);

    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;

    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");

    let animationFrameId: number;
    let startTime = performance.now();

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const render = (time: number) => {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      const t = time - startTime;
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      gl.deleteProgram(prog);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <div className="w-full max-w-[300px] aspect-square overflow-hidden flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
