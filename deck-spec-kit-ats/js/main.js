document.addEventListener("DOMContentLoaded", () => {
  const chartInstances = new Map();

  function renderIcons() {
    if (typeof lucide !== "undefined") {
      lucide.createIcons({
        attrs: {
          "aria-hidden": "true"
        },
        nameAttr: "data-lucide"
      });
    }
  }

  function initializeCharts(scope = document) {
    if (typeof echarts === "undefined") {
      return;
    }

    scope.querySelectorAll("[data-echart]").forEach((element) => {
      const configId = element.dataset.echart;
      const configElement = document.getElementById(configId);

      if (!configElement) {
        console.warn(`Missing ECharts config: ${configId}`);
        return;
      }

      try {
        const option = JSON.parse(configElement.textContent);
        const chart = chartInstances.get(element) || echarts.init(element);
        chart.setOption(option, true);
        chart.resize();
        chartInstances.set(element, chart);
      } catch (error) {
        console.error(`Invalid ECharts config: ${configId}`, error);
      }
    });
  }

  function resizeCharts() {
    chartInstances.forEach((chart) => chart.resize());
  }

  Reveal.initialize({
    hash: true,
    controls: false,
    controlsTutorial: false,
    progress: true,
    center: false,
    transition: "fade",
    backgroundTransition: "none",
    width: 1280,
    height: 720,
    margin: 0,
    minScale: 0.2,
    maxScale: 2
  }).then(() => {
    renderIcons();
    initializeCharts(Reveal.getCurrentSlide() || document);
    window.setTimeout(resizeCharts, 0);
  });

  Reveal.on("slidechanged", ({ currentSlide }) => {
    initializeCharts(currentSlide);
    window.setTimeout(resizeCharts, 0);
  });

  window.addEventListener("resize", resizeCharts);
});
