
function hull (points) {
	const sortedPoints = points.sort((a, b) => b.y - a.y);
	const minPoint = sortedPoints[0];
    let angles = [];
	for (let  i = 1; i < sortedPoints.length; i++) {
		let p1 = sortedPoints[i];
		let p2 = minPoint;
		let addAngle = 0;
		if (p1.x < p2.x) {
			addAngle = 90;
		}
		let angle = Math.atan(Math.abs(p1.y - p2.y) / Math.abs(p1.x - p2.x)) * (180 / Math.PI);
		if (angle >= 0) {
			angle = addAngle + (addAngle - angle);
		}
		angles.push({
			point: p1,
			angle
		});
	}
	
	console.log(angles);
	angles = angles.sort((a, b) => a.angle - b.angle).map(d => d.point);
	angles.unshift(minPoint);
	const hullPoints = [];
	for (let i = 0; i < angles.length; i++) {
		if (i - 2 < 0) {
			hullPoints.push(angles[i]);
		} else {
			let p1 = angles[i - 2];
			let p2 = angles[i - 1];
			let p3 = angles[i];
			const dt = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
			if (dt > 0) {
				hullPoints.pop();
			} 
			hullPoints.push(p3);
		}
	}
	console.log(hullPoints);
	hullPoints.push(angles[0]);
	d3.select('svg').append('path').attr('d', d3.line().x(d => d.x).y(d => d.y)(hullPoints))
		.style('stroke-width', '2px').style('stroke', '#000').style('fill-opacity', 0)
}


function createEnv () {
	d3.selectAll('svg').remove();
	d3.select('body').append('svg').attr('width', 500).attr('height', 500).style('background', '#ff0000');
	let points = [];
	d3.select('body').append('button').on('click', () => {
		hull(points.map(d => ({
			x: d[0],
			y: d[1]
		})));
	}).attr('value', 'click')
	d3.select('svg').on('click', function () {
		const x = d3.event.x;
		const y = d3.event.y;
		const point = d3.mouse(this);
		points.push(point);
		d3.select('svg').selectAll('circle').data(points)
			.enter()
			.append('circle').attr('cx', d => d[0]).attr('cy', d => d[1]).attr('r', 2).style('stroke', '#000')
	            .style('stroke-width', '1px');
	});
}
createEnv();