var worldContainer = document.getElementById("world");
var frameCount = 0; //for controlling framerate, e.g. skipping every other frame
var fpsReduction = 1; //1 = normal fps, 2 = half fps, 60 = 1 fps, and so forth
var islands = [];
var islands2 = [];
var islands3 = [];
var numIslands = 1;
var initialPop = 10;
var mouseX = 0, mouseY = 0;

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
        this.position = vector;
        this.velocity = new Vector2d(0,0);
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        graphics.beginFill(0xff0000);
        graphics.drawCircle(this.position.x, this.position.y, 3);
        graphics.endFill();
    }

    update () {
        //out of bounds check
        // if (this.x > this.island.maxX-10)
        //     this.position.x-=8;
        // if (this.y > this.island.maxY-10)
        //     this.y-=8;
        // if (this.x < this.island.minX+10)
        //     this.x+=8;
        // if (this.y < this.island.minY+10)
        //     this.y+=8;

        // mouse position
        this.position.x = mouseX;
        this.position.y = mouseY;
        // this.randomMove(0.5);
        // this.position.add(this.velocity);


        this.draw();
    }

    randomMove (motion=1){
        this.velocity.x += (Math.random() - 0.5) * motion;
        this.velocity.y += (Math.random() - 0.5) * motion;
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
        this.velocity = new Vector2d(0, 0, -5, 5);
        this.accel = new Vector2d(0, 0, -0.2, 0.2);
        app.stage.addChild(this.catSprite);
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(4, 10, 2);
    }

    draw() {}

    update() {
        //var output = this.network.activate(input);
        var redDot = this.island.redDot; //get this island's red dot
        var islandSize = this.island.size;
        //normalize positions by island size for NN inputs
        var input = [(this.position.x / islandSize), (this.position.y / islandSize),
                   (redDot.position.x / islandSize), (redDot.position.y / islandSize)];

        var output = this.network.activate(input);
        console.log("Output");
        console.log(output);

        //update creature's acceleration from output
        this.accel.x = output[0] > 0.5 ? output[0] : output[0] - 1;
        this.accel.y = output[1] > 0.5 ? output[1] : output[1] - 1;

        //find intended output so NN can learn
        var intendedX = this.position.x > redDot.position.x ? 0 : 1;
        var intendedY = this.position.y > redDot.position.y ? 0 : 1;
        var intendedOutput = [intendedX, intendedY];
        console.log("Intended Output");
        console.log(intendedOutput);

        //train neural network
        this.network.propagate(0.25, intendedOutput);

        //add acceleration to velocity
        this.velocity.add(this.accel);
        //add velocity to position
        this.position.add(this.velocity);
        console.log("Velocity");
        console.log(this.velocity);

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

        this.redDot.update();
    }
}

for (var i=0; i < numIslands; i++)
    islands.push(new Island(50 * i * 2.5, 0, 500, initialPop));


//cat converges on the red dot in the middle of the island
function worldLoop(delta){
    if (frameCount % fpsReduction === 0) {
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
    frameCount++;
  }

  $("body").mousemove(function(event) {
    mouseX = event.pageX - $(worldContainer).offset().left;
    mouseY = event.pageY - $(worldContainer).offset().top;
})

app.ticker.add(delta => worldLoop(delta));
app.stage.addChild(graphics);

//simple random between 2 values
function rand(min, max) {
    return (Math.random() * (max - min) + min);
}