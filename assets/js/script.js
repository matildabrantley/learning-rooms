var worldContainer = document.getElementById("world");
var islands = [];
var islands2 = [];
var islands3 = [];
var numIslands = 1;
var initialPop = 1;

//Create a Pixi Application
let app = new PIXI.Application({antialias: true });
//Add the canvas that Pixi automatically created for you to the HTML document
worldContainer.appendChild(app.view);
const graphics = new PIXI.Graphics();

//Something for cats/creatures to chase
class RedDot {
    constructor(island, vector)
    {
        this.island = island;
        this.position = vector.getCopy();
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        graphics.beginFill(0xff0000);
        graphics.drawCircle(this.position.x, this.position.y, 3);
        graphics.endFill();
    }

    update () {
        //out of bounds check
        if (this.x > this.island.maxX-10)
            this.position.x-=8;
        if (this.y > this.island.maxY-10)
            this.y-=8;
        if (this.x < this.island.minX+10)
            this.x+=8;
        if (this.y < this.island.minY+10)
            this.y+=8;

        this.draw();
    }

    randomMove (motion=1){
        this.position.x += (Math.random() - 0.5) * motion;
        this.position.y += (Math.random() - 0.5) * motion;
    }
}

//only cats for now
class Creature {
    constructor(island, vector){
        this.island = island;
        this.catSprite = PIXI.Sprite.from('/assets/images/Cat.png');
        this.catSprite.x = vector.x;
        this.catSprite.y = vector.y;
        this.position = vector.getCopy();
        this.velocity = new Vector2d(0, 0);
        app.stage.addChild(this.catSprite);
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(2, 5, 2);
    }

    draw() {}

    update() {
        //normalize position by island size 
        //var input = [(this.position.x / this.island.size), (cat.position.y / this.island.size)];
        //var output = this.network.activate(input);
        var redDot = this.island.redDot; //get this islan's red dot
        var angleDiff = this.position.angleDifference(redDot.position);
        this.velocity.setAngle(angleDiff);

        //add velocity to position
        this.position.add(this.velocity);

        //out of bounds check
        if (this.position.x > this.maxX-10)
                this.position.x-=8;
        if (this.position.y > this.maxY-10)
                this.position.y-=8;
        if (this.position.x < this.minX+10)
                this.position.x+=8;
        if (this.position.y < this.minY+10)
                this.position.y+=8;

        //set sprite x & y to position
        this.catSprite.x = this.position.x;
        this.catSprite.y = this.position.y;
    }
}

//isolated 'ecosystems'
class Island {
    constructor(minX, minY, size, pop){
        this.minX = minX;
        this.minY = minY;
        this.maxX = minX + size;
        this.maxY = minY + size;
        this.size = size;
        this.pop = pop; //population
        this.creatures = new Array(pop);
        for (var c = 0; c < pop; c++)
            this.creatures[c] = new Creature(this, new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2)); //start in middle of island

        this.redDot = new RedDot(this, new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2));
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        //graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.minX, this.minY, this.size, this.size, 10);
        graphics.endFill();

        this.redDot.randomMove(4);
        this.redDot.update();
    }
}

for (var i=0; i < numIslands; i++)
    islands.push(new Island(50 * i * 2.5, 0, 200, initialPop));


app.stage.addChild(graphics);

//simple random between 2 values
function rand(min, max) {
    return (Math.random() * (max - min) + min);
}

app.ticker.add(delta => worldLoop(delta));

//cat converges on the red dot in the middle of the island
function worldLoop(delta){
    //var outputVelocity = new Vector2d(0, 0); //output vector
    for (var i=0; i < numIslands; i++){
        graphics.clear();
        islands[i].draw();
        for (var c=0; c < islands[i].creatures.length; c++){
            islands[i].creatures[c].update();
            //var cat = islands[i].creatures[c];
            //console.log("Cat " + cat);
            //var input = [cat.position.x / islands[i].size, cat.position.y / islands[i].size];
            //console.log("Input " + input);

            //in progress: moving over this code to creature update function

            //console.log("Output " + output);
            //outputVelocity.set(output[0]-0.5, output[1]-0.5);
            //outputVelocity.multiply(10);
            //change cat's position
            //cat.position.add(outputVelocity);
            //islands[i].creatures[c].network.propagate(0.3 * (c+1)/5,[islands[i].redDot.x / islands[i].size, islands[i].redDot.y / islands[i].size]);
        }
    }
  }