
const width = 800;
const height = 400;

const margin = { top: 40, right: 40, bottom: 80, left: 60 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const drawStackedBars = (dataset) => {


  const svg = d3.select("#bars")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const formats = [
    "vinyl",
    "eight_track",
    "cassette",
    "cd",
    "download",
    "streaming",
    "other"
  ];

  const colorScale = d3.scaleOrdinal()
    .domain(formats)
    .range(d3.schemeTableau10);

  const xScale = d3.scaleBand()
    .domain(dataset.map(d => d.year))
    .range([0, innerWidth])
    .padding(0.15);

  // Percent-based scale (0–100%)
  const yScale = d3.scaleLinear()
    .domain([0, 1])
    .range([innerHeight, 0]);

  const stack = d3.stack()
    .keys(formats)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetExpand);

  const stackedData = stack(dataset);

  stackedData.forEach(series => {
    chartGroup.selectAll(`.stack-${series.key}`)
      .data(series)
      .join("rect")
      .attr("class", `stacked-bar stack-${series.key}`)
      .attr("x", d => xScale(d.data.year))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("fill", colorScale(series.key));
  });

  const dataYears = new Set(dataset.map(d => d.year));
  const tickYears = d3
    .range(1975, 2020, 5)
    .filter(y => dataYears.has(y));

  const xAxis = d3.axisBottom(xScale)
    .tickValues(tickYears)
    .tickSizeOuter(0);

  chartGroup.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(xAxis)
    .selectAll("text")

  const yAxis = d3.axisLeft(yScale)
    .tickValues(d3.range(0, 1.01, 0.1))
    .tickFormat(d => `${Math.round(d * 100)}%`);

  chartGroup.append("g")
    .attr("class", "axis y-axis")
    .call(yAxis);
};

d3.csv("/data/data.csv", d3.autoType)
  .then(data => {
    drawStackedBars(data);
  })
  .catch(error => console.error("CSV load error:", error));
