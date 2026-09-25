window.PG = window.PG || {};

PG.map = (function() {
  // 生成したノイズ画像URLをキャッシュ
  let noiseDataUrl = null;

  function generateNoise() {
    if (noiseDataUrl) return noiseDataUrl;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = val;
      data[i+1] = val;
      data[i+2] = val;
      data[i+3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    noiseDataUrl = canvas.toDataURL("image/png");
    return noiseDataUrl;
  }

  function create(container) {
    const data = PG.maps.europe;
    const svgNS = "http://www.w3.org/2000/svg";
    
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", data.viewBox);
    svg.setAttribute("width", "1920");
    svg.setAttribute("height", "1080");
    svg.style.position = "absolute";
    svg.style.inset = "0";
    svg.style.background = "#0e1016"; // 海
    
    // Land Group
    const landGroup = document.createElementNS(svgNS, "g");
    const landPath = document.createElementNS(svgNS, "path");
    landPath.setAttribute("d", data.land);
    landPath.style.fill = "#1d1a15";
    landPath.style.stroke = "var(--gold)";
    landPath.style.strokeWidth = "1.2px";
    landPath.style.strokeOpacity = "0.6";
    landPath.setAttribute("vector-effect", "non-scaling-stroke");
    landGroup.appendChild(landPath);
    
    // Cities Group
    const citiesGroup = document.createElementNS(svgNS, "g");
    
    // Routes Group
    const routesGroup = document.createElementNS(svgNS, "g");

    svg.appendChild(landGroup);
    svg.appendChild(routesGroup);
    svg.appendChild(citiesGroup);
    container.appendChild(svg);
    
    // Noise Overlay
    const noiseDiv = document.createElement("div");
    noiseDiv.style.position = "absolute";
    noiseDiv.style.inset = "0";
    noiseDiv.style.pointerEvents = "none";
    noiseDiv.style.backgroundImage = `url(${generateNoise()})`;
    noiseDiv.style.opacity = "0.08";
    container.appendChild(noiseDiv);
    
    // Initial State
    gsap.set(landPath, { fillOpacity: 0 }); // Hidden fill initially
    
    svg.style.transformOrigin = "0 0";
    gsap.set(svg, { x: 0, y: 0, scale: 1 });

    return {
      drawIn(sec) {
        const tl = gsap.timeline();
        tl.fromTo(landPath, 
          { drawSVG: "0%" }, 
          { drawSVG: "100%", duration: sec * 0.8, ease: "power2.inOut" }
        );
        tl.to(landPath, { fillOpacity: 1, duration: sec * 0.2 }, "+=0");
        return tl;
      },
      zoomTo(cityKey, scale, sec) {
        let targetX = 0, targetY = 0;
        let targetScale = scale || 1;
        
        if (cityKey && data.cities[cityKey]) {
          const city = data.cities[cityKey];
          targetX = 960 - city.x * targetScale;
          targetY = 540 - city.y * targetScale;
        } else {
          targetScale = 1;
          targetX = 0;
          targetY = 0;
        }
        
        const tl = gsap.timeline();
        tl.to(svg, {
          x: targetX,
          y: targetY,
          scale: targetScale,
          duration: sec,
          ease: "power2.inOut",
          onStart: () => {
            svg.style.willChange = 'transform';
          },
          onUpdate: () => {
            // Update scale of all pins to counter the SVG scale
            const currentScale = gsap.getProperty(svg, "scaleX") || 1;
            const k = 1 / currentScale;
            const pins = citiesGroup.querySelectorAll("g.map-pin");
            pins.forEach(pin => {
              const x = pin.getAttribute("data-x");
              const y = pin.getAttribute("data-y");
              pin.setAttribute("transform", `translate(${x}, ${y}) scale(${k})`);
            });
          },
          onComplete: () => {
            svg.style.willChange = 'auto';
          }
        });
        return tl;
      },
      pin(cityKey, options = {}) {
        const tl = gsap.timeline();
        if (!data.cities[cityKey]) return tl;
        const city = data.cities[cityKey];
        const side = options.side || 'right';
        
        // Remove existing pin if any
        const existing = citiesGroup.querySelector(`#map-pin-${cityKey}`);
        if (existing) existing.remove();
        
        // Marker
        const g = document.createElementNS(svgNS, "g");
        g.id = `map-pin-${cityKey}`;
        g.setAttribute("class", "map-pin");
        g.setAttribute("data-x", city.x);
        g.setAttribute("data-y", city.y);
        const k = 1 / (gsap.getProperty(svg, "scaleX") || 1);
        g.setAttribute("transform", `translate(${city.x}, ${city.y}) scale(${k})`);
        
        const ripple = document.createElementNS(svgNS, "circle");
        ripple.setAttribute("r", "5");
        ripple.style.fill = "none";
        ripple.style.stroke = "var(--gold)";
        ripple.style.strokeWidth = "2px";
        g.appendChild(ripple);
        
        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("r", "5");
        dot.style.fill = "var(--gold)";
        g.appendChild(dot);
        
        // Text
        const textG = document.createElementNS(svgNS, "g");
        textG.setAttribute("class", "map-pin-text");
        
        let tx = 15, ty = -15, anchor = "start";
        if (side === 'left') {
          tx = -15; ty = -15; anchor = "end";
        } else if (side === 'top') {
          tx = 0; ty = -30; anchor = "middle";
        }
        
        textG.setAttribute("transform", `translate(${tx}, ${ty})`);
        textG.style.opacity = "0";
        
        if (options.label) {
          const mainTxt = document.createElementNS(svgNS, "text");
          mainTxt.textContent = options.label;
          mainTxt.style.fill = "var(--ink)";
          mainTxt.setAttribute("font-size", "40");
          mainTxt.setAttribute("font-family", '"Yu Mincho", "游明朝", serif');
          mainTxt.setAttribute("text-anchor", anchor);
          textG.appendChild(mainTxt);
        }
        if (options.sub) {
          const subTxt = document.createElementNS(svgNS, "text");
          subTxt.textContent = options.sub;
          subTxt.style.fill = "var(--muted)";
          subTxt.setAttribute("font-size", "28");
          subTxt.setAttribute("font-family", '"Yu Gothic UI", "Meiryo", sans-serif');
          subTxt.setAttribute("y", "35");
          subTxt.setAttribute("text-anchor", anchor);
          textG.appendChild(subTxt);
        }
        
        g.appendChild(textG);
        citiesGroup.appendChild(g);
        
        // Animation
        gsap.to(ripple, {
          r: 25,
          opacity: 0,
          duration: 1.5,
          repeat: -1,
          ease: "power1.out"
        });
        
        tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.5, ease: "back.out(1.5)" });
        tl.to(textG, { opacity: 1, duration: 0.5 }, "-=0.2");
        
        return tl;
      },
      unpin(cityKey) {
        const pin = citiesGroup.querySelector(`#map-pin-${cityKey}`);
        if (pin) {
          const textG = pin.querySelector('.map-pin-text');
          if (textG) textG.remove();
        }
      },
      route(keys, sec) {
        const tl = gsap.timeline();
        if (!keys || keys.length < 2) return tl;
        
        // Draw an arc passing through cities
        const path = document.createElementNS(svgNS, "path");
        let d = `M ${data.cities[keys[0]].x},${data.cities[keys[0]].y} `;
        
        for (let i = 1; i < keys.length; i++) {
          const p1 = data.cities[keys[i-1]];
          const p2 = data.cities[keys[i]];
          // simple quadratic curve for arc
          const cx = (p1.x + p2.x) / 2;
          const cy = (p1.y + p2.y) / 2 - 50; // bow up
          d += `Q ${cx},${cy} ${p2.x},${p2.y} `;
        }
        
        path.setAttribute("d", d);
        path.style.fill = "none";
        path.style.stroke = "var(--gold)";
        path.style.strokeWidth = "2px";
        path.style.strokeDasharray = "5,5";
        path.style.opacity = "0.6";
        routesGroup.appendChild(path);
        
        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("r", "6");
        dot.style.fill = "var(--gold)";
        dot.style.filter = "drop-shadow(0 0 8px var(--gold))";
        routesGroup.appendChild(dot);
        
        tl.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%", duration: sec });
        tl.to(dot, {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5]
          },
          duration: sec,
          ease: "none"
        }, 0);
        
        return tl;
      },
      destroy() {
        if (svg.parentNode) {
          svg.parentNode.removeChild(svg);
        }
      }
    };
  }

  return { create };
})();
