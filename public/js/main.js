////// Data visualisation using D3.js library (Bar Chart)
//// Retrieve raw data for chart
let dataRetrieveSuccess = false;
async function getData() {
    try {
        const response = await fetch('/api/data');
        // Invalid endpoint/Server error
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);

        } else {
            const data = await response.json();
            console.log(data);

            // Data retrieved successfully
            if (data.length) {
                dataRetrieveSuccess = true;
                return data;

            // Data retrieved unsuccessfully
            } else {
                throw new Error("No data retrieved");
            }
        }

    } catch (error) {
        console.log(error);
    }
}

//// Draw chart
getData().then(dataset => {
    // Data retrieved unsuccessfully
    if (!dataRetrieveSuccess) {
        document.getElementById("error").hidden = false;
        return;
    }

    // Bar configuration
    const barWidth = 3;
    const barGap = 1;

    //// SVG
    // SVG configuration
    const padding = {
        top: 50,
        right: 100,
        // space between x-axis and SVG border
        bot: 90,
        // space between y-axis and SVG border
        left: 100
    };
    const height = 680;
    const width = dataset.length * (barWidth + barGap) - barGap + padding.left + padding.right;

    // Set SVG configuration
    const svg = d3.select("#container")
        .append("svg")
        .attr("height", height)
        .attr("width", width);

    // Set chart tooltip configuration
    const tooltip = d3.select("#container")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "hidden");

    // Sample item in dataset
    // ["1947-01-01", 243.1]
    // [Year Quarter, GDP (in $billion)]

    //// Bar
    // Set bar configuration
    const barScale = d3.scaleLinear()
        // Min and max GDP (in $billion) values of bar
        .domain([0, d3.max(dataset, (data) => data[1])])
        // Min and max pixel height of bar
        .range([0, height - padding.top - padding.bot]);

    // Set all bars in chart
    svg.selectAll("rect")
        .data(dataset)
        .enter()

        // Set individual bar in chart (height and width)
        .append("rect")
        .attr("height", (data) => barScale(data[1]))
        .attr("width", barWidth)

        // Set individual bar in chart (placement of individual bar on x-axis)
        .attr("x", (data, index) => padding.left + (barWidth + barGap) * index)
        // Set individual bar in chart (placement of top of individual bar in y-dimension)
        // barScale(data[1]) is pixel height of each individual bar
        .attr("y", (data) => height - padding.bot - barScale(data[1]))

        // Assign "class" attribute (value = "bar") to each individual bar
        .attr("class", "bar")
        // Assign "data-date" attribute (value = dataset item's Year Quarter) to each individual bar
        .attr("data-date", (data) => data[0])
        // Assign "data-gdp" attribute (value = dataset item's GDP (in $billion)) to each individual bar
        .attr("data-gdp", (data) => data[1])

        // Set individual bar's tooltip
        .on("mouseover", function (dataset, data) {
            // Find index of selected individual bar
            const index = svg.selectAll("rect").nodes().indexOf(this);

            // Year Quarter portion of tooltip
            let date = "";
            const splitDate = data[0].split("-");
            // Year
            date += splitDate.slice(0, 1);
            // Quarter
            if (splitDate[1] == "01") {
                date += " Q1";
            } else if (splitDate[1] == "04") {
                date += " Q2";
            } else if (splitDate[1] == "07") {
                date += " Q3";
            } else {
                date += " Q4";
            };
            
            // GDP (in $billion) portion of tooltip
            let amount = "";
            // Add thousands separator i.e. ","
            if (Math.floor(data[1]) >= 1000) {
                amount += Math.floor(data[1] / 1000).toString() + "," + (data[1] - Math.floor(data[1] / 1000) * 1000).toFixed(1).toString();
            } else {
                amount += data[1].toFixed(1).toString();
            };

            // Show tooltip
            d3.select("#tooltip").classed("hidden", false);
            
            // Tooltip configuration
            // Set position of tooltip in x- and y-dimension
            tooltip.style("top", height - padding.bot - barScale(data[1]) + "px")
                .style("left", padding.left + (barWidth + barGap) * index + 20 + "px")
                // Tooltip content
                .html(
                    date +
                    "<br>$" + amount + " Billion"
                )
                // Assign "data-date" attribute (value = selected bar's Year Quarter) to tooltip
                .attr("data-date", data[0]);
        })
        .on("mouseout", function (dataset, data) {
            tooltip.attr("class", "hidden");
        })
    
    //// X-axis
    // Set last x-axis tickmark as the next year quarter (i.e. 2015-10-01) after the last dataset item (i.e. 2015-07-01)
    const lastXAxisTickmark = new Date(dataset[dataset.length - 1][0]);
    lastXAxisTickmark.setMonth(lastXAxisTickmark.getMonth() + 3);
    
    // Set x-axis configuration
    const xScaleAxis = d3.scaleTime()
        // Min and max date values of x-axis
        .domain([new Date(dataset[0][0]), lastXAxisTickmark])
        // Min and max pixel width of x-axis
        .range([0, width - padding.left - padding.right]);
    // Define placement of x-axis (bottom of SVG)
    const xAxis = d3.axisBottom(xScaleAxis);
    
    // Draw x-axis
    svg.append("g")
        // Define position of start of x-axis (smallest x-axis value)
        .attr("transform", "translate(" + padding.left + ", " + (height - padding.bot) + ")")
        .attr("id", "x-axis")
        .call(xAxis);

    // X-axis label (text link)
    svg.append("a")
        .attr("href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
        .attr("target", "_blank")
        // X-axis label (text)
        .append("text")
        .attr("id", "xAxisText")
        .attr("transform", "translate(685, 640)")
        .text("Further reading: http://www.bea.gov/national/pdf/nipaguid.pdf")
    
    //// Y-axis
    // Set y-axis configuration
    const yScaleAxis = d3.scaleLinear()
        // Min and max GDP (in $billion) values of y-axis
        .domain([0, d3.max(dataset, (data) => data[1])])
        // Min and max pixel height of y-axis
        // Note: (0,0) of SVG is top-left corner of SVG
        // Domain of "0" (min GDP) correspond to range of "height - padding.top - padding.bot" (bottom of y-axis)
        // Domain of "d3.max(dataset, (data) => data[1])" (max GDP) correspond to range of "0" (top of y-axis)
        .range([height - padding.top - padding.bot, 0]);
    // Define placement of y-axis (left of SVG)
    const yAxis = d3.axisLeft(yScaleAxis);
    
    // Draw y-axis
    svg.append("g")
        // Define position of start of y-axis (largest y-axis value)
        .attr("transform", "translate(" + padding.left + ", " + padding.top + ")")
        .attr("id", "y-axis")
        .call(yAxis);

    // Y-axis label (text)
    svg.append("text")
        .text("Gross Domestic Product ($Billion)")
        .attr("id", "yAxisLabel")
        .attr("transform", "translate(140, 360)rotate(270)")
});