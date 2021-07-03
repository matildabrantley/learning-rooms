class Vector2d {
	constructor(x, y){
        this.x = x;
	    this.y = y;
    }

	//distance between two 2d points using Math.hypot
	distance (vector) {
		Math.hypot(vector.x-this.x, vector.y-this.y)
	}

	//add 2d vectors
	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}

	//multiply 2d vectors
	multiply(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	//dot product of 2d vectors
	dotProduct(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	}

	//for reversing direction
	reverse() {
		return (-this.x, -this.y);
	}

	//subtract 2d vectors
	subtract(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		return this;
	}
}