;(function(w, d3, undefined){
    "use strict";

    var width, height;
    function getSize(){
        width = w.innerWidth,
        height = w.innerHeight;

        if(width === 0 || height === 0){
            setTimeout(function(){
                getSize();
            }, 100);
        }
        else {
            init();
        }
    }

    function init(){

        //Setup path for outerspace
        var space = d3.geo.azimuthal()
            .mode("equidistant")
            .translate([width / 2, height / 2]);

        space.scale(space.scale() * 3);

        var spacePath = d3.geo.path()
            .projection(space)
            .pointRadius(1);

        //Setup path for globe
        var projection = d3.geo.azimuthal()
            .mode("orthographic")
            .translate([width / 2, height / 2]);

        var scale0 = projection.scale();

        var path = d3.geo.path()
            .projection(projection)
            .pointRadius(2);

        //Setup zoom behavior
        var zoom = d3.behavior.zoom(true)
            .translate(projection.origin())
            .scale(projection.scale())
            .scaleExtent([100, 800])
            .on("zoom", move);

        var circle = d3.geo.greatCircle();

        var svg = d3.select("body")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                    .call(zoom)
                    .on("dblclick.zoom", null);

        //Create a list of random stars and add them to outerspace
        var starList = createStars(300);
                
        var stars = svg.append("g")
            .selectAll("g")
            .data(starList)
            .enter()
            .append("path")
                .attr("class", "star")
                .attr("d", function(d){
                    spacePath.pointRadius(d.properties.radius);
                    return spacePath(d);
                });


        svg.append("rect")
            .attr("class", "frame")
            .attr("width", width)
            .attr("height", height);

        //Create the base globe
        var backgroundCircle = svg.append("circle")
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', projection.scale())
            .attr('class', 'globe')
            .attr("filter", "url(#glow)")
            .attr("fill", "url(#gradBlue)");

        var g = svg.append("g"),
            features;

        //Add all of the countries to the globe
        d3.json("../build/world-islands.json", function(collection) {
            // features = g.selectAll(".feature").data(collection.features);

            // features.enter().append("path")
            //     .attr("class", "feature")
            //     .attr("d", function(d){ return path(circle.clip(d)); });
        });

        var imgs = svg.selectAll("image").data([0]);
        imgs.enter()
        .append("svg:image")
        .attr("xlink:href", "../img/1.svg")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("width", "50")
        .attr("height", "50");
        
        //Redraw all items with new projections
        function redraw(){
            // features.attr("d", function(d){
            //     return path(circle.clip(d));
            // });

            stars.attr("d", function(d){
                spacePath.pointRadius(d.properties.radius);
                return spacePath(d);
            });
        }


        function move() {
            if(d3.event){
                var scale = d3.event.scale;
                var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];
                
                imgs.attr('width', scale * 50 / projection.scale())
                    .attr('height', scale * 50 / projection.scale())
                    .attr('transform', 'translate(' + origin[0] * -1 + ', ' + origin[1] + ')')
                    .style('opacity', d => {
                        return isInGlove(imgs.attr('x') - origin[0], parseInt(imgs.attr('y')) + origin[1], scale, imgs.attr('width'), imgs.attr('height'));
                    });
                // projection.scale(scale);
                space.scale(scale * 3);
                backgroundCircle.attr('r', scale);
                path.pointRadius(2 * scale / scale0);

                projection.origin(origin);
                circle.origin(origin);
                
                //globe and stars spin in the opposite direction because of the projection mode
                var spaceOrigin = [origin[0] * -1, origin[1] * -1];
                space.origin(spaceOrigin);
                redraw();
            }
        }


        function createStars(number){
            var data = [];
            for(var i = 0; i < number; i++){
                data.push({
                    geometry: {
                        type: 'Point',
                        coordinates: randomLonLat()
                    },
                    type: 'Feature',
                    properties: {
                        radius: Math.random() * 1.5
                    }
                });
            }
            return data;
        }

        function randomLonLat(){
            return [Math.random() * 360 - 180, Math.random() * 180 - 90];
        }

        function isInGlove(x, y, r, w, h) {
            var rx = width / 2 - x - w / 2;
            var ry = height / 2 - y - h / 2;

            // if (x < 0) {
            //     rx = width / 2 + x - w / 2;
            // }

            // if (Math.abs(rx) > 3 * r) {
            //     rx = - (rx % (2 * r));
            // }
            console.log(rx, ry, r)
            return (rx * rx + ry * ry < r * r) ? 1 : 0;
        }
    }

    getSize();

}(window, d3));