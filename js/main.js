let entitys = [];  // all entitys
let relationships = [];  // all relationship

let node = [];  // current node
let edges = [];  // current edges
let circleRadius = 15;
let circleRadiusPlus = 25;
let colorScale = d3.scaleOrdinal()  // 颜色比例尺
				.domain(d3.range(entitys.length))
				.range(d3.schemeCategory10);
let currentYear;
let currentEntity;

let forceSimulation = null;
let margin = 10;
var yearFormat = d3.timeFormat("%Y");
let yearScale;
(function(){
	
	d3.csv("/data.csv").then(function(d){  // generate the entity data.
		entitys = d;
		initEntitys();

	}); 

	d3.csv("/links.csv").then(function(d){  // generate the chart by entitys and their relationship.
		
		d.forEach((r)=>{
			r.year = +r.year;
		})

		relationships = d;
		initGraph();
		initTimeLine();
	})
}());


function initEntitys(){
	let entitysElement = d3.selectAll(".entitys")
		.selectAll(".enetity")
		.data(entitys)
		.enter()
		.append("div")
		.attr("class", "entity")
		

	entitysElement.append("img")
		.attr("class", "entity-pic")
		.attr("src", function(d){
			return "./img/" + d.logo;
		})
		.on("click", function(d){  // when click the entity
			currentEntity = d.name;

			d3.select("#current")
				.attr("class", "entity-pic")
				.attr("id", "")

			d3.select(this)
				.attr("class", "entity-pic clicked")
				.attr("id" ,"current")

			einfo = d3.select(".entity-infos")
			
			einfo.select('.img')
				.remove();

			einfo.select('.name')
				.remove();

			einfo.select('.content')
				.remove();

			einfo.append("img")
				.attr("class", "img")
				.attr("src", './img/' + d.logo)

			einfo.append("div")
				.attr("class", "name")
				.html(d.name)

			einfo.append("p")
				.attr("class", "content")
				.html(d.info);
			let move = false;
			d3.select(".ticks")
				.selectAll("text")
				.attr("fill", function(a){
					let yearFormat = d3.timeFormat("%Y")
					
					for(let i = 0; i < relationships.length; i++){
						if(relationships[i].target == d.id || relationships[i].source == d.id){

							if(relationships[i].year == yearFormat(a)){
								if(move === false){
									console.log("test")
									d3.select(".handle")
										.attr("transform", `translate(${yearScale(a)})`)
									d3.select(".label")
										.text(relationships[i].year)
									control_data(relationships[i].year)
									move = true;
								}
								return "#22bb22";
							}
						}
					}
					return "#000";		
				})
				.style("font-size", function(a){
					let yearFormat = d3.timeFormat("%Y")

					for(let i = 0; i < relationships.length; i++){
						if(relationships[i].target == d.id || relationships[i].source == d.id){

							if(relationships[i].year == yearFormat(a)){
								return "14px";
							}
						}
					}
					return "12px";		
				});


		})


	entitysElement.append("div")
		.attr("class", "entity-name")
		.html(function(d){
			return d.name;
		})
}

function initGraph(){


	width = parseInt(d3.select(".chart").style("width")) - margin * 2;
	height = parseInt(d3.select(".chart").style("height")) - margin * 2;


	let svg = d3.select("svg")
				// .append("svg")
				// .attr("width", chart.style("width"))
				// .attr("height", chart.style("height"));



	forceSimulation = d3.forceSimulation()  // create the simulation;
							.force("link",d3.forceLink())
			    			.force("charge",d3.forceManyBody().strength(-50))
			    			// .force("center",d3.forceCenter().x(width/2).y(height/2));


	control_data(2011);
}

function generateGraph(){
	let svg = d3.select("svg");


	svg.selectAll(".circleText")
						.remove();

	svg.selectAll(".linkTexts")
						.remove();

	let circleText = svg.selectAll(".circleText")
						.data(nodes)
						.enter()
						.append("g")
						.attr("class", "circleText")
						.attr("transform", function(d){ 
							d.x = width/2 + Math.random()*200;
							d.y = height/2+Math.random()*200;

							return `translate(${d.x}, ${d.y})`
						})
						.call(d3.drag()
								.on("start", function(d){
									if(!d3.event.active){
										forceSimulation.alphaTarget(0.1).restart();  // set 
									}
									d.fx = d.x;
									d.fy = d.y;
								})
								.on("drag", function(d){
									d.fx = Math.max(5, Math.min(width - 5, d3.event.x));
									d.fy = Math.max(5, Math.min(height - 5, d3.event.y));
								})
								.on("end", function(d){
									if(!d3.event.active){
										forceSimulation.alphaTarget(0).restart();
									}
									d.fx = null;
									d.fy = null;
								})
							)
	let linkTexts = svg.selectAll(".linkTexts")
						.data(edges)
						.enter()
						.append("text")
						.attr("class", "linkTexts")
						.text(function(d){
							return d.relationship;
						})
	let links = svg.selectAll(".links")
					.data(edges)
					.enter()
					.append("line")
					.attr("class", "linkTexts")
					.attr("stroke", "#373737")
					.attr("stroke-width", 1);

	circleText.append("circle")
				.attr("r", circleRadius)
				.attr("fill", function(d, i){
					return colorScale(i);
				})
				.style("cursor", "pointer");

	circleText.append("text")
				.attr("x", -10)
				.attr("y", -15)
				.text(function(d){
					return d.name;
				});





	forceSimulation.on("tick", function(){
		forceSimulation.alphaTarget(0.05).restart();
		links.attr("x1", function(d){ return d.source.x})
			.attr("y1", function(d){ return d.source.y})
			.attr("x2", function(d){ return d.target.x})
			.attr("y2", function(d){ return d.target.y});

		circleText.attr("transform", function(d){
			d.x = Math.max(circleRadius, Math.min(width - circleRadius, d.x));
			d.y = Math.max(circleRadius, Math.min(height - circleRadius, d.y));
			return `translate(${d.x}, ${d.y})`
		});
		linkTexts.attr("x", function(d){return (d.source.x + d.target.x) / 2;})		
				.attr("y", function(d){return (d.source.y + d.target.y) / 2})

		circleText.selectAll("circle")
					.attr("r", function(d){
						if(currentEntity == d.name){
							return circleRadiusPlus;
						}
						return circleRadius;
					})
	});
}




function initTimeLine(){

	let margin = 20;

	let svg = d3.select("svg")
	let width = parseInt(svg.style("width")) - margin * 2;
	let height = parseInt(svg.style("height")) - margin * 2;

	let year_min = d3.min(relationships, function(d){return d.year});
	let year_max = d3.max(relationships, function(d){return d.year});

	
	let startDate = new Date(year_min.toString())
	let endDate = new Date(year_max.toString())


	currentYear = yearFormat(startDate);

	yearScale = d3.scaleTime()  // generate year scale
					.domain([startDate, endDate])
					.range([margin, width])
					.clamp(true);

	let slider = svg.append("g")
					.attr("class", "slider")
					.attr("width", width)
					.attr("transform", `translate(${margin}, ${height})`)

	slider.append("line")  // create track
			.attr("class", "track")
			.attr("x1", yearScale.range()[0])
			.attr("x2", yearScale.range()[1])
			.select(function(){return this.parentNode.appendChild(this.cloneNode(true))})
			.attr("class", "track-inset")
			.select(function(){return this.parentNode.appendChild(this.cloneNode(true))})
			.attr("class", "track-overlay")

	let handle = slider.insert("g", ".track-overlay")
			.attr("class", "handle")
			.attr("transform", `translate(${margin}, 0)`)

	handle.append("circle")
			.attr("r", 5)

	handle.append("text")
			.attr("dx", -15)
			.attr("y", -10)
			.attr("class", "label")
			.text(yearFormat(startDate))

	slider.insert("g", ".handle")
			.attr("class", "ticks")
			.attr("transform", `translate(0, 12)`)
			.selectAll("text")	
			.data(yearScale.ticks(9))
			.enter()
			.append("text")
			.attr("x", yearScale)
			.attr("y", 10)
			.attr("text-anchor", "middle")
			.text(function(d){
				return yearFormat(d);
			});


	d3.select(".track-overlay")
		.call(d3.drag()
				.on("start drag", function(){
					let year = yearFormat(yearScale.invert(d3.event.x));
					let x = yearScale(yearScale.invert(d3.event.x));
					d3.select(".handle")
						.attr("transform", `translate(${x}, 0)`)
					d3.select(".label")
						.text(function(d){
							return year;
						});
					if(currentYear !== year){
						control_data(year)
						currentYear = year;
					}
				}))

}


function control_data(year){  // control the nodes by year slider.
	nodes = new Set();
	edges = [];

	relationships.forEach((relationship)=>{
		if(relationship.year == year){
			edges.push(JSON.parse(JSON.stringify(relationship)));
			nodes.add(JSON.parse(JSON.stringify(entitys[relationship.source])));
			nodes.add(JSON.parse(JSON.stringify(entitys[relationship.target])));
		}
	});

	nodes = Array.from(nodes);  // set to array

	if(nodes.length == 0){
		d3.select("svg")
			.append("text")
			.attr("id", "nofound")
			.text("this year is peaceful")
			.style("font-size", "32px")
			.style("fill", "#65ad3e")
			.attr("transform", function(){
					selfWidth = d3.select(this).node().getBoundingClientRect().width; 

					return `translate(${width / 2 - selfWidth / 2}, ${height / 2})`
				})
	}else{
		d3.select("svg")
			.select("#nofound")
			.remove();
	}
	forceSimulation.nodes(nodes);
	forceSimulation.force("link")
					.id(function(d){
						return d.id;
					})
					.links(edges)
					.distance(function(){
						return 200;
					})

	generateGraph()


}