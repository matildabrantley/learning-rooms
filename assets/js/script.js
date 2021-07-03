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

    randomMove (){
        this.x += Math.random() - 0.5;
        this.y += Math.random() - 0.5;
    }
}

//only cats for now
class Creature {
    constructor(vector){
        this.cat = PIXI.Sprite.from('/assets/images/Cat.png');
        this.cat.x = vector.x;
        this.cat.y = vector.y;
        app.stage.addChild(this.cat);
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(2, 5, 2);
    }

    draw() {

        // graphics.lineStyle(2, 0xFF00FF); 
        // graphics.beginFill(0x000000, 1);
        // graphics.drawCircle(this.x, this.y, 5);
        // graphics.endFill();
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

        this.redDot = new RedDot(new Vector2d((minX+this.maxX)/2 + (minY+this.maxY)/2));
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        //graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.minX, this.minY, this.size, this.size, 10);
        graphics.endFill();

        for (var c = 0; c < this.pop; c++) {
            if (this.creatures[c].cat.x > this.maxX-10)
                this.creatures[c].cat.x-=8;
            if (this.creatures[c].cat.y > this.maxY-10)
                this.creatures[c].cat.y-=8;
            if (this.creatures[c].cat.x < this.minX+10)
                this.creatures[c].cat.x+=8;
            if (this.creatures[c].cat.y < this.minY+10)
                this.creatures[c].cat.y+=8;
        }
    }
}

    for (var i=0; i < numIslands; i++)
        islands.push(new Island(50 * i * 2.5, 0, 100, 1));


app.stage.addChild(graphics);

//simple random between 2 values
function rand(min, max) {
    return (Math.random() * (max - min) + min);
}

app.ticker.add(delta => worldLoop(delta));

//cat converges on the red dot in the middle of the island
function worldLoop(delta){
    for (var i=0; i < numIslands; i++){
        islands[i].draw();
        for (var c=0; c < islands[i].creatures.length; c++){
            var input = [];
            input.push(islands[i].creatures[c].cat.x/100);
            input.push(islands[i].creatures[c].cat.y/100);

            var output = islands[i].creatures[c].network.activate(input);

            console.log(output);

            islands[i].creatures[c].cat.x = output[0] * 100;
            islands[i].creatures[c].cat.y = output[1] * 100;

            islands[i].creatures[c].network.propagate(0.3,[0.5, 0.5]);

            console.log(islands[i].creatures[c].cat.x + " : " + islands[i].creatures[c].cat.y);

        }
    }
  }