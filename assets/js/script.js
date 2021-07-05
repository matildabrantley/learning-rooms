var worldContainer = document.getElementById("world");
var frameCount = 0; //for controlling framerate, e.g. skipping every other frame
var fpsReduction = 1; //1 = normal fps, 2 = half fps, 60 = 1 fps, and so forth
var islands = [];
var numIslands = 1;
var initialPop = 10; //initial island population
var islandNames = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N',
                      'O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var mouseX = 0, mouseY = 0;
var learningPeriod = 1500; //number of frames that backpropagation occurs

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
        this.velocity = new Vector2d(0,0, 10, 10);
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        graphics.beginFill(0xff0000);
        graphics.drawCircle(this.position.x, this.position.y, 3);
        graphics.endFill();
    }

    update () {
        //out of bounds check
        if (this.position.x > this.island.maxX-20){
            //this.velocity.reverse();
            this.velocity.x = -this.velocity.x * 0.8;
            this.position.x -= 10;
        }
        if (this.position.y > this.island.maxY-20){
            //this.velocity.reverse();
            this.velocity.y = -this.velocity.y * 0.8;
            this.position.y -= 10;
        }
        if (this.position.x < this.island.minX+20){
            //this.velocity.reverse();
            this.velocity.x  = -this.velocity.x * 0.8;
            this.position.x += 10;
        }
        if (this.position.y < this.island.minY+20){
            //this.velocity.reverse();
            this.velocity.y = -this.velocity.y * 0.8;
            this.position.y += 10;
        }

        // mouse position
        //this.position.x = mouseX;
        //this.position.y = mouseY;
        if (frameCount < learningPeriod)
            this.randomTeleport();
        else {
            this.randomMove(0.5);
            if (frameCount % 100 == 0){
                this.velocity.set(0,0);
                this.randomMove(5);
            }
            this.position.add(this.velocity);
        }

        this.draw();
    }

    randomMove (motion=1){
        this.velocity.x += (Math.random() - 0.5) * motion;
        this.velocity.y += (Math.random() - 0.5) * motion;
    }

    randomTeleport () {
        this.position.x = rand(0, this.island.size);
        this.position.y = rand(0, this.island.size);
    }
}

//only cats for now
class Creature {
    constructor(island, vector, learningRate = 0.25){
        this.island = island;
        this.catSprite = PIXI.Sprite.from('/assets/images/Cat.png');
        this.catSprite.x = vector.x;
        this.catSprite.y = vector.y;
        this.position = vector.getCopy();
        this.velocity = new Vector2d(0, 0, -7, 7);
        this.accel = new Vector2d(0, 0, -0.5, 0.5);
        this.learningRate = learningRate;
        this.fitness = 0;
        app.stage.addChild(this.catSprite);
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(2, 100, 2);
    }

    draw() {}

    update() {
        //get this island's size and its red dot
        var islandSize = this.island.size;
        var redDot = this.island.redDot; 
        
        //normalize positions by island size (for NN inputs)
        var input = [(redDot.position.x / islandSize), (redDot.position.y / islandSize)];
        var output = this.network.activate(input);
        // console.log("Output");
        // console.log(output);

        this.position.x = output[0] * islandSize;
        this.position.y = output[1] * islandSize;


        // //update creature's acceleration from output
        // this.accel.x = output[0] > 0.5 ? output[0] : output[0] - 1;
        // this.accel.y = output[1] > 0.5 ? output[1] : output[1] - 1;

        // //find intended output so NN can learn
        // var intendedX = this.position.x > redDot.position.x ? 0 : 1;
        // var intendedY = this.position.y > redDot.position.y ? 0 : 1;
        // var intendedOutput = [intendedX, intendedY];

        //train neural network
        if (frameCount < learningPeriod)
            this.network.propagate(this.learningRate, [(redDot.position.x / islandSize), (redDot.position.y / islandSize)]);

        //add acceleration to velocity
        // this.velocity.add(this.accel);
        // //add velocity to position
        // this.position.add(this.velocity);

        //out of bounds check
        if (this.position.x > this.island.maxX-20){
            //this.velocity.reverse();
            this.velocity.x = -this.velocity.x * 0.8;
            this.position.x -= 10;
        }
        if (this.position.y > this.island.maxY-20){
            //this.velocity.reverse();
            this.velocity.y = -this.velocity.y * 0.8;
            this.position.y -= 10;
        }
        if (this.position.x < this.island.minX+20){
            //this.velocity.reverse();
            this.velocity.x  = -this.velocity.x * 0.8;
            this.position.x += 10;
        }
        if (this.position.y < this.island.minY+20){
            //this.velocity.reverse();
            this.velocity.y = -this.velocity.y * 0.8;
            this.position.y += 10;
        }

        //set sprite x & y to position
        this.catSprite.x = this.position.x;
        this.catSprite.y = this.position.y;
    }
}

//isolated 'ecosystems'
class Island {
    constructor(name, minX, minY, size, pop){
        this.minX = minX;
        this.minY = minY;
        this.maxX = minX + size;
        this.maxY = minY + size;
        this.size = size;

        this.pop = pop; //population
        this.creatures = new Array(pop);
        this.popFitness = new Array(pop); //array of indices for sorting by fitness
        for (var c = 0; c < pop; c++)
            this.creatures[c] = new Creature(this, new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2)); //start in middle of island

        this.redDot = new RedDot(this, new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2));
    }

    update() {
        this.redDot.update();
        for (var c=0; c < this.creatures.length; c++) {
            this.creatures[c].update();
            this.popFitness[c] = this.creatures[c].fitness;
        }
        this.draw();
        this.genetics();
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        //graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.minX, this.minY, this.size, this.size, 10);
        graphics.endFill();
    }

    genetics() {
        //fitness sorting
        this.popFitness.sort((a, b) => (a.fitness > b.fitness) ? 1 : -1);




        // var tempPopFitness = popFitness.splice(); 
        // for (var i=0; i<populace.length; i++) 
        // {
        // for (var j=0; j<populace.length; j++)
        //     if ((tempPopFitness[j] > (tempPopFitness[fittestNet[i]])
        //             fittestNet[i] = j;
        //     tempPopFitness[fittestNet[i]] = -10;
        // }
    }

}

//cat converges on the red dot in the middle of the island
function worldLoop(delta){
    if (frameCount % fpsReduction === 0) {
        graphics.clear();
        for (var i=0; i < numIslands; i++){
            islands[i].update();
        }
    }
    frameCount++;
    $('#controls').text(frameCount);
  }

  $("body").mousemove(function(event) {
    mouseX = event.pageX - $(worldContainer).offset().left;
    mouseY = event.pageY - $(worldContainer).offset().top;
})

//simple random between 2 values
function rand(min, max) {
    return (Math.random() * (max - min) + min);
}

function start() {
    //create islands
    for (var i=0; i < numIslands; i++)
        islands.push(new Island(islandNames[i], 50 * i * 2.5, 0, 500, initialPop));
    //send worldLoop to Pixi ticker
    app.ticker.add(delta => worldLoop(delta));
    app.stage.addChild(graphics);
}

start();