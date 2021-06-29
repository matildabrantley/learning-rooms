var worldContainer = document.getElementById("world");
//Create a Pixi Application
let app = new PIXI.Application({antialias: true });

//Add the canvas that Pixi automatically created for you to the HTML document
worldContainer.appendChild(app.view);

const graphics = new PIXI.Graphics();

class Creature {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    draw() {
        graphics.lineStyle(2, 0xFF00FF); 
        graphics.beginFill(0x000000, 1);
        graphics.drawCircle(this.x, this.y, 5);
        graphics.endFill();
    }
}

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
        this.creatures[c] = new Creature(rand(minX, this.maxX), rand(minY, this.maxY));
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.minX, this.minY, this.size, this.size, 10);
        graphics.endFill();

        for (var c = 0; c < this.pop; c++)
            this.creatures[c].draw();
    }
}

var island = new Island(50, 50, 100, 5);
var island2 = new Island(200, 50, 100, 15);
var island3 = new Island(350, 50, 100, 40);
island.draw();
island2.draw();
island3.draw();


app.stage.addChild(graphics);

//simple random between 2 values
function rand(min, max) {
    return (Math.random() * (max - min) + min);
}
  