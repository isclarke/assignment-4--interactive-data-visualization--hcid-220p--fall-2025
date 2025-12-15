// ---- Dimensions & Margins ----
const width = 800;
const height = 400;
const margin = { top: 40, right: 40, bottom: 40, left: 40 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// ---- Scales ----
const xScale = d3.scalePoint()
    .domain([1975, 1995, 2013])
    .range([100, innerWidth - 100]); // add padding so pies don't get clipped

const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

// ---- Load CSV Data ----
d3.csv(`data/data.csv`, d3.autoType).then(data => {

    const svg = d3.select(`#donut`)
        .append(`svg`)
        .attr(`viewBox`, `0 0 ${width} ${height}`);

    const donutContainers = svg
        .append(`g`)
        .attr(`transform`, `translate(${margin.left}, ${margin.top})`);

    const years = [1975, 1995, 2013];
    const formats = data.columns.filter(format => format !== `year`);

    years.forEach(year => {
        const donutContainer = donutContainers
            .append(`g`)
            .attr(`transform`, `translate(${xScale(year)}, ${innerHeight/2})`);

        const yearData = data.find(d => d.year === +year);
        const formattedData = formats.map(format => ({
            format: format,
            sales: +yearData[format]
        }));

        const pieGenerator = d3.pie()
            .value(d => d.sales)
            .sort(null);

        const annotatedData = pieGenerator(formattedData);

        // ---- Smaller pie ----
        const arcGenerator = d3.arc()
            .innerRadius(40)  // smaller inner radius
            .outerRadius(80)  // smaller outer radius
            .padAngle(0.02)
            .cornerRadius(3);

        const arcs = donutContainer
            .selectAll(`.arc-${year}`)
            .data(annotatedData)
            .join(`g`)
            .attr(`class`, `arc-${year}`);

        arcs.append(`path`)
            .attr(`d`, arcGenerator)
            .attr(`fill`, d => colorScale(d.data.format));

        arcs.append(`text`)
            .text(d => {
                d.percentage = (d.endAngle - d.startAngle) / (2 * Math.PI);
                return d3.format(`.0%`)(d.percentage);
            })
            .attr(`x`, d => {
                d.centroid = arcGenerator.centroid(d);
                return d.centroid[0];
            })
            .attr(`y`, d => d.centroid[1])
            .attr(`class`, `pie-label`);

        // Append year label below the pie
        donutContainer.append(`text`)
            .text(year)
            .attr(`text-anchor`, `middle`)
            .attr(`dominant-baseline`, `middle`)
            .attr(`class`, `year-label`)
            .attr(`y`, 110); // adjust below the smaller pie
    });

}).catch(error => console.error(`Error loading CSV:`, error));
