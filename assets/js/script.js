var worldContainer = document.getElementById("world");
var islands = [];
var islands2 = [];
var islands3 = [];
var numIslands = 6;

//Create a Pixi Application
let app = new PIXI.Application({antialias: true });
//Add the canvas that Pixi automatically created for you to the HTML document
worldContainer.appendChild(app.view);
const graphics = new PIXI.Graphics();

class Creature {
    constructor(x, y){
        this.cat = PIXI.Sprite.from('/assets/images/Cat.png');
        this.cat.x = x;
        this.cat.y = y;
        app.stage.addChild(this.cat);
    }

    draw() {

        // graphics.lineStyle(2, 0xFF00FF); 
        // graphics.beginFill(0x000000, 1);
        // graphics.drawCircle(this.x, this.y, 5);
        // graphics.endFill();
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
        this.creatures[c] = new Creature(rand(minX+20, this.maxX-20), rand(minY+20, this.maxY-20));
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
        islands.push(new Island(50 + 50 * i * 2.5, 50, 100, 3));
    for (var i=0; i < numIslands; i++)
        islands2.push(new Island(50 + 50 * i * 2.5, 200, 100, 3));
    for (var i=0; i < numIslands; i++)
        islands3.push(new Island(50 + 50 * i * 2.5, 350, 100, 3));


// var island = new Island(50, 50, 100, 5);
// var island2 = new Island(200, 50, 100, 15);
// var island3 = new Island(350, 50, 100, 40);
// island.draw();
// island2.draw();
// island3.draw();





app.stage.addChild(graphics);

//simple random between 2 values
function rand(min, max) {
    return (Math.random() * (max - min) + min);
}

app.ticker.add(delta => worldLoop(delta));

function worldLoop(delta){
    for (var i=0; i < numIslands; i++){
        islands[i].draw();
        for (var c=0; c < islands[i].creatures.length; c++){
            islands[i].creatures[c].cat.x += (Math.random()-0.5) * delta;
            islands[i].creatures[c].cat.y += (Math.random()-0.5) * delta;
        }
    }

    for (var i=0; i < numIslands; i++){
        islands2[i].draw();
        for (var c=0; c < islands2[i].creatures.length; c++){
            islands2[i].creatures[c].cat.x += 3 * (Math.random()-0.5) * delta;
            islands2[i].creatures[c].cat.y += 3 * (Math.random()-0.5) * delta;
        }
    }

    for (var i=0; i < numIslands; i++){
        islands3[i].draw();
        for (var c=0; c < islands3[i].creatures.length; c++){
            islands3[i].creatures[c].cat.x += 5 * (Math.random()-0.5) * delta;
            islands3[i].creatures[c].cat.y += 5 * (Math.random()-0.5) * delta;
        }
    }
  }