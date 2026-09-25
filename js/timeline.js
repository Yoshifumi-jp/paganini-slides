window.PG = window.PG || {};

PG.timeline = (function() {
  let container, line, currentIndicator, currentYearLabel, eventsContainer;
  const startYear = 1780;
  const endYear = 1850;
  const totalYears = endYear - startYear;
  
  const events = [
    { year: 1782, label: '誕生' },
    { year: 1794, label: '初の公開演奏' },
    { year: 1805, label: 'ルッカの宮廷へ' },
    { year: 1828, label: 'ウィーンへ' },
    { year: 1831, label: 'パリ・ロンドン' },
    { year: 1840, label: 'ニースで死去' }
  ];

  let currentYearValue = startYear;
  let activeEventLabels = [];

  function build() {
    const stage = document.getElementById('stage');
    
    container = document.createElement('div');
    container.id = 'timeline-bar';
    container.style.position = 'absolute';
    container.style.top = '30px';
    container.style.left = '160px';
    container.style.right = '160px';
    container.style.height = '80px';
    container.style.pointerEvents = 'none';
    container.style.opacity = '0';
    container.style.zIndex = '50';
    container.style.display = 'none';
    
    // Line
    line = document.createElement('div');
    line.style.position = 'absolute';
    line.style.top = '60px';
    line.style.left = '0';
    line.style.right = '0';
    line.style.height = '2px';
    line.style.background = 'var(--gold)';
    container.appendChild(line);

    // Ticks
    for (let y = startYear; y <= endYear; y += 10) {
      const p = ((y - startYear) / totalYears) * 100;
      
      const tick = document.createElement('div');
      tick.style.position = 'absolute';
      tick.style.left = `${p}%`;
      tick.style.top = '55px';
      tick.style.width = '2px';
      tick.style.height = '12px';
      tick.style.background = 'var(--muted)';
      container.appendChild(tick);
      
      const label = document.createElement('div');
      label.textContent = y;
      label.style.position = 'absolute';
      label.style.left = `${p}%`;
      label.style.top = '70px';
      label.style.transform = 'translateX(-50%)';
      label.style.fontSize = '24px';
      label.style.color = 'var(--muted)';
      label.style.fontFamily = '"Yu Gothic UI", "Meiryo", sans-serif';
      container.appendChild(label);
    }
    
    // Event Dots
    eventsContainer = document.createElement('div');
    eventsContainer.style.position = 'absolute';
    eventsContainer.style.inset = '0';
    container.appendChild(eventsContainer);
    
    events.forEach(ev => {
      const p = ((ev.year - startYear) / totalYears) * 100;
      
      const dot = document.createElement('div');
      dot.className = 'timeline-event-dot';
      dot.style.position = 'absolute';
      dot.style.left = `${p}%`;
      dot.style.top = '61px';
      dot.style.width = '8px';
      dot.style.height = '8px';
      dot.style.borderRadius = '50%';
      dot.style.background = 'var(--muted)';
      dot.style.transform = 'translate(-50%, -50%)';
      dot.style.transition = 'background 0.3s, box-shadow 0.3s';
      ev.dotEl = dot;
      eventsContainer.appendChild(dot);
      
      const label = document.createElement('div');
      label.textContent = ev.label;
      label.style.position = 'absolute';
      label.style.left = `${p}%`;
      label.style.top = '30px';
      label.style.transform = 'translateX(-50%)';
      label.style.fontSize = '24px';
      label.style.color = 'var(--ink)';
      label.style.fontFamily = '"Yu Gothic UI", "Meiryo", sans-serif';
      label.style.opacity = '0';
      label.style.transition = 'opacity 0.3s';
      label.style.whiteSpace = 'nowrap';
      ev.labelEl = label;
      eventsContainer.appendChild(label);
    });

    // Current Indicator
    currentIndicator = document.createElement('div');
    currentIndicator.style.position = 'absolute';
    currentIndicator.style.top = '61px';
    currentIndicator.style.width = '16px';
    currentIndicator.style.height = '16px';
    currentIndicator.style.borderRadius = '50%';
    currentIndicator.style.background = 'var(--gold)';
    currentIndicator.style.boxShadow = '0 0 10px var(--gold)';
    currentIndicator.style.transform = 'translate(-50%, -50%)';
    container.appendChild(currentIndicator);
    
    currentYearLabel = document.createElement('div');
    currentYearLabel.style.position = 'absolute';
    currentYearLabel.style.top = '10px';
    currentYearLabel.style.transform = 'translateX(-50%)';
    currentYearLabel.style.fontSize = '32px';
    currentYearLabel.style.color = 'var(--gold)';
    currentYearLabel.style.fontFamily = '"Yu Gothic UI", "Meiryo", sans-serif';
    container.appendChild(currentYearLabel);
    
    stage.appendChild(container);
  }

  function updateIndicator(year) {
    currentYearValue = year;
    const p = ((year - startYear) / totalYears) * 100;
    currentIndicator.style.left = `${p}%`;
    currentYearLabel.style.left = `${p}%`;
    currentYearLabel.textContent = Math.round(year);
    
    // Check events
    events.forEach(ev => {
      if (year >= ev.year && !ev.passed) {
        ev.passed = true;
        // 点灯
        ev.dotEl.style.background = 'var(--gold)';
        ev.dotEl.style.boxShadow = '0 0 8px var(--gold)';
        // ラベル表示 (1.5s)
        ev.labelEl.style.opacity = '1';
        
        const timeoutId = setTimeout(() => {
          ev.labelEl.style.opacity = '0';
        }, 1500);
        activeEventLabels.push({ el: ev.labelEl, timeoutId });
      } else if (year < ev.year && ev.passed) {
        ev.passed = false;
        ev.dotEl.style.background = 'var(--muted)';
        ev.dotEl.style.boxShadow = 'none';
        ev.labelEl.style.opacity = '0';
      }
    });
  }

  let isVisible = false;

  return {
    init: () => {
      if (!container) build();
    },
    show: () => {
      if (!container) PG.timeline.init();
      if (!isVisible) {
        container.style.display = 'block';
        gsap.to(container, { autoAlpha: 1, duration: 0.5 });
        isVisible = true;
      }
    },
    hide: () => {
      if (container && isVisible) {
        gsap.to(container, { autoAlpha: 0, duration: 0.5, onComplete: () => {
          container.style.display = 'none';
        }});
        isVisible = false;
      }
    },
    setYear: (year) => {
      if (!container) PG.timeline.init();
      // リセット passed state for accurate triggering
      events.forEach(ev => ev.passed = (ev.year <= year));
      events.forEach(ev => {
        ev.dotEl.style.background = ev.passed ? 'var(--gold)' : 'var(--muted)';
        ev.dotEl.style.boxShadow = ev.passed ? '0 0 8px var(--gold)' : 'none';
      });
      updateIndicator(year);
    },
    moveTo: (year, sec) => {
      if (!container) PG.timeline.init();
      const obj = { y: currentYearValue };
      return gsap.to(obj, {
        y: year,
        duration: sec,
        ease: 'power1.inOut',
        onUpdate: () => {
          updateIndicator(obj.y);
        }
      });
    }
  };
})();

