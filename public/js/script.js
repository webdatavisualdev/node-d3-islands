;(function(w, d3, undefined){
"use strict";

    var width, height, islandsData;
    var xVal = 300, yVal = 300;
    var pxStep = 1, nxStep = 1, pyStep = 1, nyStep = 1;
    var xFocus = 0, yFocus = 0;

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

        space.scale(space.scale() * 5);

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
            .pointRadius(5);

        //Setup zoom behavior
        var zoom = d3.behavior.zoom(true)
            .translate(projection.origin())
            .scale(projection.scale())
            .scaleExtent([100, 20000])
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
        var islands = g.append("g")
            .attr('class', 'islands')
            .attr('transform', 'translate(' + (width - 800) / 2 + ', ' + (height - 800) / 2 + ') scale(2)');

        //Add all of the countries to the globe
        d3.json("/build/world-countries.json", function(collection) {
            features = g.selectAll(".feature").data(collection.features);

            // features.enter().append("path")
            //     .attr("class", "feature")
            //     .attr("d", function(d){ return path(circle.clip(d)); });
        });

        d3.json("/build/world-islands.json", function(islands) {
            islandsData = islands;
            drawIslands();
        });

        //Redraw all items with new projections
        function redraw(){
            features.attr("d", function(d){
                return path(circle.clip(d));
            });

            stars.attr("d", function(d){
                spacePath.pointRadius(d.properties.radius);
                return spacePath(d);
            });
        }

        function drawIslands() {
            d3.selectAll(".islands svg").remove();
            islandsData.map(d => {
                if (d.id < 4000) {
                    d3.xml("../img/" + (1 + d.id)+ ".svg", "image/svg+xml", function(xml) {
                        var importedNode = document.importNode(xml.documentElement, true);
                        d3.select(importedNode).attr('width', d.size)
                            .attr('height', d.size)
                            .attr('x', d.position.x)
                            .attr('y', d.position.y)
                            .attr('id', d.id)
                            .attr('opacity', function() {
                                if (Math.abs(200 - d.position.x) * Math.abs(200 - d.position.x) + Math.abs(200 - d.position.y) * Math.abs(200 - d.position.y) > 100 * 100)
                                    return 0;
                                return 1;
                            })
                            .attr('class', 'island')
                            .on('click', function() {
                                d3.selectAll('body .tooltip').remove();
                                d3.selectAll('body').append('div')
                                    .attr('class', 'tooltip')
                                    .style('left', $('#' + d.id).position().left + 'px')
                                    .style('top', $('#' + d.id).position().top + 'px')
                                    .append('p')
                                    .text(d.text)
                                    .append('a')
                                    .attr('target', '_blank')
                                    .text(d.url)
                                    .attr('href', d.url);
                            });
        
                        d3.select(importedNode).select('g').attr('fill', d.color);
                        
                        d3.select(".islands")
                            .each(function() {
                                this.appendChild(importedNode);
                            })
                    });
                }
            });
        }

        function redrawIslands(type) {
            let flag1 = false, flag2 = false, flag3 = false, flag4 = false;
            d3.selectAll('.islands svg')[0].map(d => {
                d3.select(d)
                    .attr('x', function() {
                        if (d3.select(this).attr('x') > xVal && type === 0) {
                            flag1 = true;
                            return d3.select(this).attr('x') - 400;
                        } else if (d3.select(this).attr('x') < xVal - 200 && type === 1) {
                            flag2 = true;
                            return parseInt(d3.select(this).attr('x')) + 400;
                        }
                        return d3.select(this).attr('x');
                    })
                    .attr('y', function() {
                        if (d3.select(this).attr('y') > yVal && type === 2) {
                            flag3 = true;
                            return d3.select(this).attr('y') - 400;
                        } else if (d3.select(this).attr('y') < yVal - 200 && type === 3) {
                            flag4 = true;
                            return parseInt(d3.select(this).attr('y')) + 400;
                        }
                        return d3.select(this).attr('y');
                    });
            });

            if (flag1) {
                xVal -= 100;
            }

            if (flag2) {
                xVal += 100;
            }

            if (flag3) {
                yVal -= 100;
            }

            if (flag4) {
                yVal += 100;
            }
        }


        function move() {
            if(d3.event){
                d3.selectAll('.tooltip').remove();

                var scale = d3.event.scale;

                var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];
                var x = d3.event.translate[0] + (width - 4 * scale) / 2;
                var y = d3.event.translate[1] + (height - 4 * scale) / 2;
                islands.attr("transform", "translate(" + x + ", " + y + ")scale(" + scale / 100 + ")");

                d3.selectAll('.islands svg')[0].map(d => {
                    d3.select(d)
                        .attr('opacity', function() {
                            if (Math.abs(200 - d3.select(this).attr('x') - d3.event.translate[0] * 100 / scale) * Math.abs(200 - d3.select(this).attr('x') - d3.event.translate[0] * 100 / scale) + Math.abs(200 - d3.select(this).attr('y') - d3.event.translate[1] * 100 / scale) * Math.abs(200 - d3.select(this).attr('y') - d3.event.translate[1] * 100 / scale) > 100 * 100)
                                return 0;
                            return 1;
                        });
                });

                if (d3.event.translate[0] > d3.event.scale * pxStep && d3.event.translate[0] - xFocus > 0) {
                    xFocus = d3.event.translate[0];
                    pxStep += 1;
                    nxStep -=1;
                    redrawIslands(0);
                } else if (d3.event.translate[0] < (-1) * d3.event.scale * nxStep && d3.event.translate[0] - xFocus < 0) {
                    xFocus = d3.event.translate[0];
                    nxStep += 1;
                    pxStep -= 1;
                    redrawIslands(1);
                } else if (d3.event.translate[1] > d3.event.scale * pyStep && d3.event.translate[1] - yFocus > 0) {
                    yFocus = d3.event.translate[1];
                    pyStep += 1;
                    nyStep -=1;
                    redrawIslands(2);
                } else if (d3.event.translate[1] < (-1) * d3.event.scale * nyStep && d3.event.translate[1] - yFocus < 0) {
                    yFocus = d3.event.translate[1];
                    nyStep += 1;
                    pyStep -= 1;
                    redrawIslands(3);
                }
                
                projection.scale(scale);
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
    }

    getSize();

}(window, d3));