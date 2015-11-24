
var width = 700, height = 600;

var projection = d3.geo.mercator()
   					.center([-73.94, 40.70])
   					.scale(50000)
   					.translate([100 + (width) / 2, (height)/2 ]);


var svg = d3.select("body").append("svg")
     .attr("width", width)
     .attr("height", height);

   // title
var info =  svg.append("g")
      .attr("id", "infoblock")





d3.json("ms_districts.json", function(error, nyb) {
  console.log(nyb)

 	var path = d3.geo.path()
 			.projection(projection);

 	var g = svg.append("g");

  d3.json("parks3.json", function(error, prks) {

        var path = d3.geo.path()
           .projection(projection);

        var ps = g.append("g")
                 .attr("id","parks")
                 .selectAll(".parkP")
                 .data(topojson.feature(prks, prks.objects.parks_computed).features)
                 .enter().append("path")
                 .attr("class","park")
                 .attr("id", function(d) { return "district " + d.GISPROPNUM; })
                 .attr("d", path)

       console.log('hahaha')

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
            .attr("y", 55)
            .attr("id","COUNCILDIS")
            .text("Council District: " + d.properties.COUNCILDIS)

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

       labelEnter.append("label").text(function(d) {return d;});

      //  ViZ MODES
       d3.selectAll("input").on("change", change);

       function change() {
        //  change viz mode
            mode = this.value;
            // console.log(modes[mode])
            choropleth(mode)

          }

      function choropleth(mode) {
        // show/hide choropleth of districts
        // and legend

        // 

      }


 	})
