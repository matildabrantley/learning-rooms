var worldContainer = document.getElementById("world");
var frameCount = 0; //for controlling framerate, e.g. skipping every other frame
var fpsReduction = 1; //1 = normal fps, 2 = half fps, 60 = 1 fps, and so forth
var islands = [];
var numIslands = 1;
var initialPop = 5; //initial island population
var islandNames = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N',
                      'O','P','Q','R','S','T','U','V','W','X','Y','Z'];
var mouseX = 0, mouseY = 0;
var learningPeriod = 3000; //number of frames that backpropagation occurs

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
        this.velocity = new Vector2d(0, 0, -20, 20);
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
        // if (frameCount < learningPeriod)
        //    this.randomTeleport();
        // else {
            this.randomMove(0.5);
             if (frameCount % 1000 == 0){
                 this.velocity.set(0,0);
                 this.randomMove(0.1);
             }
            this.position.add(this.velocity);
        //}

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
        this.velocity = new Vector2d(0, 0, -27, 27);
        this.accel = new Vector2d(0, 0, -0.5, 0.5);
        this.learningRate = learningRate;
        this.fitness = 0;
        app.stage.addChild(this.catSprite);
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(2, 10, 2);
    }

    draw() {}

    update() {
        //console.log(this.network);

        //get this island's size and its red dot
        var islandSize = this.island.size;
        var redDot = this.island.redDot; 
        
        //normalize positions by island size (for NN inputs)
        var input = [(redDot.position.x / islandSize), (redDot.position.y / islandSize)];
                   //(this.position.x / islandSize), (redDot.position.y / islandSize)];
        var output = this.network.activate(input);
        // console.log("Output");
        // console.log(output);

        //this.position.x = output[0] * islandSize;
        //this.position.y = output[1] * islandSize;

        //the vector to be changed by output, such as accel or velocity
        var changing = this.velocity; 
        //update creature's acceleration from output
        changing.x = (output[0] * 2 * changing.max) - changing.max;
        changing.y = (output[1] * 2 * changing.max) - changing.max 


        // find intended output so NN can learn
        // arrange position data for NN, for example: (-1 to 0) -> (0 -> 2) -> (0 -> 1)
        var intendedX = (((redDot.position.x - this.position.x) / islandSize) + 1) / 2;
        var intendedY = (((redDot.position.y - this.position.y) / islandSize) + 1) / 2;
        var intendedOutput = [intendedX, intendedY];

        //train neural network
        if (frameCount < learningPeriod)
            this.network.propagate(this.learningRate, intendedOutput);

        //add acceleration to velocity
        this.velocity.add(this.accel);
        //add velocity to position
        this.position.add(this.velocity);

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

        //reward
        //var distance = this.position.distance(redDot.position);
        //this.fitness += 1 / (distance+1);
        this.fitness += this.position.x + this.position.y;
    }

    mutate(rate, scale = 0.1) {
        var net = this.network;
        //mutate weights from input
        for (var j = 0; j < net.layers.input.list.length; j++)
            for (var k = 0; k < net.layers.input.list[j].connections.projected.length; j++)
                //if (rate < Math.random())
                    net.layers.input.list[j].connections.projected[k].weight += (Math.random()-0.5) * scale;
        //mutate weights from hidden layers       
        for (var i = 0; i < net.layers.hidden.length; i++)
            for (var j = 0; j < net.layers.hidden[i].list.length; j++)
                for (var k = 0; k < net.layers.hidden[i].list[j].connections.projected.length; j++)
                    //if (rate < Math.random())
                        net.layers.hidden[i].list[j].connections.projected[k].weight += (Math.random()-0.5) * scale;
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
        for (var c = 0; c < pop; c++)
            this.creatures[c] = new Creature(this, new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2)); //start in middle of island

        this.redDot = new RedDot(this, new Vector2d((minX+this.maxX)/2, (minY+this.maxY)/2));
    }

    update() {
        this.redDot.update();
        for (var c=0; c < this.pop; c++) 
            this.creatures[c].update();

        this.draw();
        //this.genetics();
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        //graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.minX, this.minY, this.size, this.size, 10);
        graphics.endFill();
    }

    genetics() {
        //fitness sorting
        this.creatures.sort((a, b) => (a.fitness > b.fitness) ? 1 : -1);
        
        //the better the fitness, the lower the mutation rate
        for (var c=0; c < this.pop; c++)
            this.creatures[c].mutate((c+1) / this.pop);

        this.pop = this.creatures.length;
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