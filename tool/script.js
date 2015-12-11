
var width = 700, height = 600;

var projection = d3.geo.mercator()
   					.center([-73.94, 40.70])
   					.scale(50000)
   					.translate([100 + (width) / 2, (height)/2 ]);


var svg = d3.select("body")
    .style('color','black')
    .append("svg")
     .attr("width", width)
     .attr("height", height);

   // title
var info =  svg.append("g")
      .attr("id", "infoblock");


var ScoresGradient = ["#B7F8C7","#91DFAE","#70C699","#52AD89","#39937A","#257A6C","#14615E"];

var complainGradient = ["#DAF495","#CAEA8C","#BAE083","#AAD67B","#9BCC73","#8DC26B","#7FB964"];

d3.json("ms_districts3.json", function(error, nyb) {
  console.log('districts uploaded')

 	var path = d3.geo.path()
 			.projection(projection);

 	var g = svg.append("g");
  console.log('parks uploaded')
  d3.json("parks3.json", function(error, prks) {

        var path = d3.geo.path()
           .projection(projection);

        var ps = g.append("g")
                 .selectAll(".parkP")
                 .data(topojson.feature(prks, prks.objects.parks_computed).features)
                 .enter().append("path")
                 .attr("class","park")
                 .attr("id", function(d) { return "park_ " + d.GISPROPNUM; })
                 .attr("d", path);

      })


  g.append("g")
   .attr("id", "background")
   .append("path")
        .datum(topojson.merge(nyb, nyb.objects.districts.geometries))
        .attr("class", "back")
        .attr("d", path);



  svg.append("g")
       .attr("id", "districts")
       .selectAll(".state")
       .data(topojson.feature(nyb, nyb.objects.districts).features)
       .enter().append("path")
       .attr("class", "district")
       .attr("id", function(d) { return "district " + d.id; })
       .attr("d", path)
       .on("mouseover", function(d){

         d3.select(this).transition()
                        .style("opacity", 1)
                        .style("color", "rgb(122, 201, 123)");;

         coordinates = path.centroid(d);
         //Create the tooltip label
         svg.append("text")
         .attr("id", "tooltip")
         .attr("x", coordinates[0])
         .attr("y", coordinates[1])
         .attr("text-anchor", "middle")
         .attr("font-family", "sans-serif")
         .attr("font-size", "11px")
         .attr("font-weight", "bold")
         .attr("fill", "black")
         .text(d.properties.SYSTEM);

         var card = svg.select("#infoblock")
            .append("g")
            .attr("transform","translate(8,120)")
            .attr("id",'distrCard');

         card.append("rect")
            .attr("id",'cardBack')
            .attr("width",235)
            .attr("height",70)

         card.append("text")
            .attr("x", 10)
            .attr("y", 25)
            .attr("id",'dID')
            .text(d.properties.SYSTEM);

         card.append("text")
            .attr("x", 10)
            .attr("y", 42)
            .attr("id","COUNCILDIS")
            .text("Council District: " + d.properties.COUNCILDIS)

         card.append("text")
            .attr("x", 10)
            .attr("y", 54)
            .attr("id","calls")
            .text("311 complains: " + d.properties.calls2015)

        card.append("text")
            .attr("x", 10)
            .attr("y", 66)
            .attr("id","pip")
            .text("PIP score: " + d.properties.PIPscore.toFixed(2))

       } )
       .on("mouseout", function() {
         //Remove the tooltip
         d3.select("#tooltip").remove();
         d3.select("#distrCard").remove();
       });


       // ---- RADIO BUTTONS
       var modes = ["Property", "Scores", "Complains"],
       j = 0;  // Choose the rectangle as default

       //
       var form = d3.select("body")
                    .append("div")
                    .append("h1")
                    .attr('id','title')
                    .text("NYC Park Quality");


       // Create the shape selectors
       var form = d3.select("body")
                    .append("div")
                    .attr('id','formDiv')
                    .append("form");

       var labelEnter = form.selectAll("span")
                  .data(modes)
                  .enter()
                  .append("span")
                  .attr('class','rButton');

       labelEnter.append("input")
                 .attr({
                      type: "radio",
                      class: "shape",
                      name: "mode",
                      value: function(d, i) {return i;}
                  })
                 .property("checked", function(d, i) {
                      return (i===j);
                  });

       labelEnter.append('label').text(function(d) {return d;});

      //  ViZ MODES
       d3.selectAll("input").on("change", change);

       function change() {
        //  change viz mode
            mode = this.value;
            console.log(mode);
            choropleth(mode);

          }

      function choropleth(mode) {
        // var rate = d3.map();

        var quantize = [function(){return "red" },
                        d3.scale.quantize()
                         .domain([.40, 1.00])
                         .range(d3.range(7).map(function (i) { return ScoresGradient[i]; })),
                        d3.scale.quantize()
                            .domain([5, 816])
                          .range(d3.range(7).map(function (i) { return complainGradient[i]; }))
                        ][mode];

        if (mode==2) {
          d3.selectAll('.district').transition()
          .style('fill-opacity', '0.6')
          .style('fill', function (d) { return quantize(d.properties.calls2015) })
        } else if (mode==1) {
          d3.selectAll('.district').transition()
          .style('fill-opacity', '0.6')
          .style('fill', function (d) { return quantize(d.properties.PIPscore) })
        } else {
          d3.selectAll('.district').transition()
            .style('fill-opacity', '0.0')
            .style('fill', function (d) { return quantize() })
        }

        d3.selectAll('.park').transition()
            .style('fill',function (){ return ["rgb(155, 226, 155)", "rgb(210, 223, 210)", "rgb(210, 223, 210)"][mode]})

      }


      function getDataRange() {
    // function loops through all the data values from the current data attribute
    // and returns the min and max values

      var min = Infinity, max = -Infinity;
      d3.selectAll('.district')
        .each(function(d,i) {
          var currentValue = d.properties[attributeArray[currentAttribute]];
          if(currentValue <= min && currentValue != -99 && currentValue != 'undefined') {
            min = currentValue;
          }
          if(currentValue >= max && currentValue != -99 && currentValue != 'undefined') {
            max = currentValue;
          }
      });
      return [min,max];  //boomsauce
      }

      //Adding legend for our Choropleth

  //  var legend = svg.selectAll("g.legend")
  //  .data(ext_color_domain)
  //  .enter().append("g")
  //  .attr("class", "legend")
  //  .attr("transform","translate(600,120)");
   //
  //  var ls_w = 30, ls_h = 20;
   //
  //  legend.append("rect")
  //  .attr("x", 20)
  //  .attr("y", function(d, i){ return height - (i*ls_h) - 2*ls_h;})
  //  .attr("width", ls_w)
  //  .attr("height", ls_h)
  //  .style("fill", function(d, i) { return color(d); })
  //  .style("opacity", 0.8);

  //  legend.append("text")
  //  .attr("x", 50)
  //  .attr("y", function(d, i){ return height - (i*ls_h) - ls_h - 4;})
  //  .text(function(d, i){ return legend_labels[i]; });


 	})
