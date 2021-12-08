const req = new XMLHttpRequest();
req.open("GET", "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json", true);
req.send();
req.onload = function() {
  let dataset = JSON.parse(req.responseText).data;

  const barWidth = 3;
  const barGap = 1;
  const padding = {
    top: 50,
    bot: 90,
    left: 100,
    right: 100
  };
  const height = 680;
  const width = dataset.length*(barWidth + barGap) - barGap + padding.left + padding.right;

  const svg = d3.select("#container")
                .append("svg")
                .attr("height", height)
                .attr("width", width);
  const tooltip = d3.select("#container")
                    .append("div")
                    .attr("id", "tooltip")
                    .attr("class", "hidden");
  const yScale = d3.scaleLinear()
                   .domain([0, d3.max(dataset, (d) => d[1])])
                   .range([0, height - padding.top - padding.bot]);

  svg.selectAll("rect")
     .data(dataset)
     .enter()
     .append("rect")
     .attr("width", barWidth)
     .attr("height", (d) => yScale(d[1]))
     .attr("x", (d,i) => padding.left + (barWidth + 1)*i)
     .attr("y", (d) => height - yScale(d[1]) - padding.bot)
     .attr("class", "bar")
     .attr("data-date", (d) => d[0])
     .attr("data-gdp", (d) => d[1])

     .on("mouseover", function(d, i) {
        const index = svg.selectAll("rect").nodes().indexOf(this);

        let date = "";
        const splitDate = i[0].split("-");
        date += splitDate.slice(0,1);
        if(splitDate[1]=="01") {
          date += " Q1";
        } else if(splitDate[1]=="04") {
          date += " Q2";
        } else if(splitDate[1]=="07") {
          date += " Q3";
        } else {
          date += " Q4";
        };

        let amount = "";
        if(Math.floor(i[1])>=1000) {
          amount += Math.floor(i[1]/1000).toString() + "," + (i[1] - Math.floor(i[1]/1000)*1000).toFixed(1).toString();
        } else {
          amount += i[1].toString();
        };

        d3.select("#tooltip").classed("hidden", false);
        tooltip.style("top", height - yScale(i[1]) - padding.bot + "px")
               .style("left", padding.left + (barWidth + 1)*index + 20 + "px")
               .html(date + "<br>" + "$" + amount + " Billion")
               .attr("data-date", i[0]);
     })

     .on("mouseout", function(d, i) {
        tooltip.attr("class", "hidden");
     })

  const lastXAxisTickmark = new Date(dataset[dataset.length-1][0]);
  lastXAxisTickmark.setMonth(lastXAxisTickmark.getMonth() + 3);

  const xScaleAxis = d3.scaleTime()
                       .domain([new Date(dataset[0][0]), lastXAxisTickmark])
                       .range([0, width - padding.left - padding.right]);
  const xAxis = d3.axisBottom(xScaleAxis);
  svg.append("g")
      .attr("transform", "translate("+ padding.left +", " + (height - padding.bot) + ")")
      .attr("id", "x-axis")
      .call(xAxis);
  const yScaleAxis = d3.scaleLinear()
                    .domain([0, d3.max(dataset, (d) => d[1])])
                    .range([height - padding.top - padding.bot, 0]);
  const yAxis = d3.axisLeft(yScaleAxis);
  svg.append("g")
     .attr("transform", "translate("+ padding.left +", "+ padding.top +")")
     .attr("id", "y-axis")
     .call(yAxis);

  svg.append("text")
     .text("Gross Domestic Product ($Billion)")
     .attr("id", "yAxisLabel")
     .attr("transform", "translate(140, 360)rotate(270)")

  svg.append("a")
     .attr("href", "http://www.bea.gov/national/pdf/nipaguid.pdf")
     .attr("target", "_blank")
     .append("text")
     .attr("id", "xAxisText")
     .attr("transform", "translate(685, 640)")
     .text("Further reading: http://www.bea.gov/national/pdf/nipaguid.pdf")
};
