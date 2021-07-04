class Vector2d {
	constructor(x, y){
        this.x = x;
	    this.y = y;
    }

	//return new instance of this vector
	getCopy() {
		var vector = new Vector2d(this.x, this.y);
		return vector;
	}

	//distance between two 2d points using Math.hypot
	distance(vector) {
		return Math.hypot(vector.x - this.x, vector.y - this.y)
	}

	//add 2d vectors, returning result
	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}

	//multiply 2d vectors, returning result
	multiply(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}

	//return dot product of 2d vectors
	getDotProduct(vector) {
		return (this.x * vector.x) + (this.y * vector.y);
	}

	//for reversing direction
	reverse() {
		return (-this.x, -this.y);
	}

	//subtract 2d vectors, returning result
	subtract(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		return this;
	}

	set(x, y) {
		this.x = x;
		this.y = y;
	}

	setAngle(angle)
	{
		this.x = Math.cos(angle);
		this.y = Math.sin(angle);
		return this;
	}

	getAngle() {
		return Math.atan2(this.y, this.x);
	}

	angleDifference(vector) {
		return (this.getAngle() - vector.getAngle());
	}
}