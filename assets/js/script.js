var worldContainer = document.getElementById("world");
var islands = [];
var islands2 = [];
var islands3 = [];
var numIslands = 1;

//Create a Pixi Application
let app = new PIXI.Application({antialias: true });
//Add the canvas that Pixi automatically created for you to the HTML document
worldContainer.appendChild(app.view);
const graphics = new PIXI.Graphics();

//Something for cats/creatures to chase
class RedDot {
    constructor(vector)
    {
        this.x = vector.x;
        this.y = vector.y;
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        graphics.beginFill(0xff0000);
        graphics.drawCircle(this.x, this.y, 3);
        graphics.endFill();
    }

    randomMove (motion=1){
        this.x += (Math.random() - 0.5) * motion;
        this.y += (Math.random() - 0.5) * motion;
    }
}

//only cats for now
class Creature {
    constructor(vector){
        this.catSprite = PIXI.Sprite.from('/assets/images/Cat.png');
        this.catSprite.x = vector.x;
        this.catSprite.y = vector.y;
        this.position = new Vector2d(vector.x,  vector.y);
        this.velocity = new Vector2d(0, 0);
        app.stage.addChild(this.catSprite);
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(2, 5, 2);
    }

    draw() {

        // graphics.lineStyle(2, 0xFF00FF); 
        // graphics.beginFill(0x000000, 1);
        // graphics.drawCircle(this.x, this.y, 5);
        // graphics.endFill();
    }

    update() {
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
            this.creatures[c] = new Creature(new Vector2d(minX, minY)); //(minX+this.maxX)/2 + (minY+this.maxY)/2)

        this.redDot = new RedDot(new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2));
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        //graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.minX, this.minY, this.size, this.size, 10);
        graphics.endFill();

        this.redDot.randomMove(4);
        this.redDot.draw();

        if (this.redDot.x > this.maxX-10)
            this.redDot.x-=8;
        if (this.redDot.y > this.maxY-10)
            this.redDot.y-=8;
        if (this.redDot.x < this.minX+10)
            this.redDot.x+=8;
        if (this.redDot.y < this.minY+10)
            this.redDot.y+=8;

        for (var c = 0; c < this.pop; c++) {
            if (this.creatures[c].position.x > this.maxX-10)
                this.creatures[c].position.x-=8;
            if (this.creatures[c].position.y > this.maxY-10)
                this.creatures[c].position.y-=8;
            if (this.creatures[c].position.x < this.minX+10)
                this.creatures[c].position.x+=8;
            if (this.creatures[c].position.y < this.minY+10)
                this.creatures[c].position.y+=8;
        }
    }
}

for (var i=0; i < numIslands; i++)
    islands.push(new Island(50 * i * 2.5, 0, 200, 10));


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
            var cat = islands[i].creatures[c];
            console.log("Cat " + cat);
            var input = [cat.position.x / islands[i].size, cat.position.y / islands[i].size];
            console.log("Input " + input);

            //in progress: moving over this code to creature update function

            //var output = islands[i].creatures[c].network.activate(input);
            //console.log("Output " + output);
            //outputVelocity.set(output[0]-0.5, output[1]-0.5);
            //outputVelocity.multiply(10);
            //change cat's position
            //cat.position.add(outputVelocity);
            //islands[i].creatures[c].network.propagate(0.3 * (c+1)/5,[islands[i].redDot.x / islands[i].size, islands[i].redDot.y / islands[i].size]);
        }
    }
  }