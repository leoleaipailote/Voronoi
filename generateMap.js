/**
* Creates random points in a given rectangle.
*
* @param {*} start The beginning of one side of your rectangle.
* @param {*} end The end of the same side of your rectangle.
* @param {*} start2 The beginning of the adjacent side of your rectangle.
* @param {*} end2 The end of the adjacent side of your rectangle.
* @param {*} pValue A percentage to determine how likely the point should exist.
* @returns An array of random points within your given rectangle.
*/
function squigglyPointGenerator(start, end, start2, end2, pValue) {
    squigglyPoints = [];
   
   
    for (let sX = start; sX < end; sX++) {
      for (let sY = start2; sY < end2; sY++) {
        if (Math.random() < pValue) {
          squigglyPoints.push(
            (obj = {
              x: sX.toString(),
              y: sY.toString(),
            })
          );
        }
      }
    }
   
   
    return squigglyPoints;
   }
   
   
   /**
   * Creates the scales to make a voronoi diagram.
   * It creates a scale for the x-axis and the y-axis.
   * Additionally, it creates a scale to create voronoi lines from a list of points.
   * @param {*} dataBounds The minimum and maximum x and y values of the points you are creating a voronoi from.
   * @param {*} HEIGHT The height of the svg.
   * @param {*} WIDTH The width of the svg.
   * @returns All of the scales in a dictionary.
   */
   function createScales(dataBounds, HEIGHT, WIDTH) {
    var xScale = d3
      .scaleLinear()
      .domain([dataBounds["minXVal"], dataBounds["maxXVal"]])
      .range([WIDTH / 4, (3 * WIDTH) / 4]);
   
   
    var yScale = d3
      .scaleLinear()
      .domain([dataBounds["minYVal"], dataBounds["maxYVal"]])
      .range([(3 * HEIGHT) / 4, HEIGHT / 4]);
   
   
    var voronoiScale = d3
      .voronoi()
      .x((d) => d.x)
      .y((d) => d.y)
      .extent([
        [0, 0],
        [WIDTH, HEIGHT],
      ]);
   
   
    return { xScale: xScale, yScale: yScale, voronoiScale: voronoiScale };
   }
   
   
   /**
   * Creates points on an svg.
   *
   * @param {*} data A list of the x and y values to draw.
   * @param {*} svg The svg to draw on.
   * @param {*} color The color of the points.
   * @param {*} className The class name of the points.
   */
   function drawPoints(data, svg, color, className) {
    // Plot the data points (black)
    svg
      .append("g")
      .attr("class", className)
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 2)
      .style("fill", color);
   }
   
   
   /**
   * Creates random points around a voronoi diagram to make the external lines squiggly.
   *
   * @param {*} HEIGHT The height of the svg.
   * @param {*} WIDTH The width of the svg.
   * @param {*} x The scale of the x-axis.
   * @param {*} y The scale of the y-axis.
   * @param {*} dataBounds The minimum and maximum x and y values of the points you are creating a voronoi from.
   * @returns A list of the random points around the voronoi diagram.
   */
   function createSquigglyPoints(HEIGHT, WIDTH, x, y, dataBounds) {
    const K_DISTANCE_RATIO = 0.7 / 0.15;
    const KW_DISTANCE =
      (dataBounds["maxXVal"] - dataBounds["minXVal"]) / K_DISTANCE_RATIO;
    const KH_DISTANCE =
      (dataBounds["maxYVal"] - dataBounds["minYVal"]) / K_DISTANCE_RATIO;
    const P_VALUE = 0.01;
    const POINTS_RADIUS = 2;
   
   
    let squigglyPointsLeft = squigglyPointGenerator(
      POINTS_RADIUS,
      x(dataBounds["minXVal"] - KW_DISTANCE),
      POINTS_RADIUS,
      HEIGHT,
      P_VALUE
    );
   
   
    let squigglyPointsRight = squigglyPointGenerator(
      x(dataBounds["maxXVal"] + KW_DISTANCE),
      WIDTH,
      POINTS_RADIUS,
      HEIGHT,
      P_VALUE
    );
   
   
    let squigglyPointsBottom = squigglyPointGenerator(
      POINTS_RADIUS,
      WIDTH,
      POINTS_RADIUS,
      y(dataBounds["maxYVal"] + KH_DISTANCE),
      P_VALUE
    );
   
   
    let squigglyPointsTop = squigglyPointGenerator(
      POINTS_RADIUS,
      WIDTH,
      y(dataBounds["minYVal"] - KH_DISTANCE),
      HEIGHT,
      P_VALUE
    );
   
   
    var squigglyPoints = [
      ...squigglyPointsLeft,
      ...squigglyPointsRight,
      ...squigglyPointsTop,
      ...squigglyPointsBottom,
    ];
   
   
    return squigglyPoints;
   }
   
   
   /**
   * Finds values that are not undefined.
   * @returns True for defined values
   */
   function isNotUndefined(d) {
    if (typeof d == "undefined") {
      return false;
    }
    return true;
   }
   
   
   /**
   * Draws the lines of a voronoi diagram for a set of points.
   *
   * @param {*} data The points to create a voronoi diagram of.
   * @param {*} squigglyPoints Random points around a voronoi diagram to make the external lines squiggly.
   * @param {*} voronoi The scale to create a voronoi diagram from points.
   * @param {*} svg The svg to draw the voronoi diagram on.
   */
   function drawVoronoiLines(data, squigglyPoints, voronoi, svg) {
    const ORIGINAL_POINTS_LENGTH = data.length;
   
   
    data = d3.merge([data, squigglyPoints]); //combine original data and random points to re-compute voronoi
    let voronoiPolygons = voronoi(data).polygons().filter(isNotUndefined);
    originalVoronoiPolygons = voronoiPolygons.slice(0, ORIGINAL_POINTS_LENGTH);
   
   
    svg
      .append("g")
      .attr("class", "voronoiLines")
      .selectAll("path")
      .data(originalVoronoiPolygons)
      .enter()
      .append("path") // Add a <path> element for each polygon
      .attr("d", (d) => {
        return "M" + d.join("L") + "Z"; // Generate a path string for the current polygon
      })
      .attr("fill", "green")
      .attr("fill-opacity", 100)
      .attr("stroke", "black")
      .attr("stroke-opacity", 100);
   }
   
   
   /**
   * The minimum and maximum x and y values of an array of points.
   * @param {*} data An array of points.
   * @returns The minimum X, the minimum Y, the maximum X, and the maximum Y.
   */
   function retrieveDataBounds(data) {
    const xValues = data.map((d) => parseInt(d.x));
    const yValues = data.map((d) => parseInt(d.y));
   
   
    let dataBounds = {
      minXVal: d3.min(xValues),
      minYVal: d3.min(yValues),
      maxXVal: d3.max(xValues),
      maxYVal: d3.max(yValues),
    };
   
   
    return dataBounds;
   }
   
   
   /**
   * Function to create a voronoi diagram given data.
   * @param {*} data The points to create the voronoi from
   */
   function createVoronoi(data) {
    const HEIGHT = 500;
    const WIDTH = 500;
   
   
    d3.select("svg").selectAll("g").remove(); // Clear the svg, if anything is there
   
   
    var svg = d3 // Create the main svg element
      .select("svg")
      .attr("height", HEIGHT)
      .attr("width", WIDTH)
      .append("g");
   
   
    var dataBounds = retrieveDataBounds(data);
   
   
    var {
      xScale: x,
      yScale: y,
      voronoiScale: voronoi,
    } = createScales(dataBounds, HEIGHT, WIDTH); // Create scales
   
   
    var squigglyPoints = createSquigglyPoints(
      // Create points to make external map lines squiggly
      HEIGHT,
      WIDTH,
      x,
      y,
      dataBounds
    );
   
   
    data.forEach((d) => {
      //scale data points
      d.x = x(d.x);
      d.y = y(d.y);
    });
   
   
    drawVoronoiLines(data, squigglyPoints, voronoi, svg);
    drawPoints(data.slice(0, data.length), svg, "black", "mainVoronoiPoints");
    drawPoints(squigglyPoints, svg, "red", "squigglyPoints");
   }
   
   
   /**
   * Function to get the information submitted into the html form.
   * Then draws the Voronoi.
   */
   function relayChartInformation() {
    window.event.preventDefault();
    const voronoiForm = document.getElementById("voronoiDataForm");
    const voronoiFormJS = new FormData(voronoiForm);
    var voronoiPoints = voronoiFormJS.get("voronoiPoints");
    voronoiPoints = d3.csvParse(voronoiPoints);
    createVoronoi(voronoiPoints);
   }
   
   
   const voronoiDataForm = document.getElementById("voronoiDataForm");
   voronoiDataForm.onsubmit = relayChartInformation;
   