const worldContainer = $(document.getElementById("world"));
let frameCount = 0; //for controlling framerate, e.g. skipping every other frame
let fpsReduction = 1; //1 = normal fps, 2 = half fps, 60 = 1 fps, and so forth
const rooms = [];
let numRooms = 6;
let initialPop = 10; //initial room population
const roomNames = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N',
                      'O','P','Q','R','S','T','U','V','W','X','Y','Z'];
const roomFloors = ['/learning-rooms/assets/images/carpet2.jpg', '/learning-rooms/assets/images/carpet1.jpg'];
const rangeContainerPrototype = $('#range-container-proto');
const roomSize = 200;
let mouseX = 0, mouseY = 0;
let learningPeriod = 200; //number of frames that backpropagation occurs
let generationLength = 1000; //frequency of fitness sorting and genetic changes
let laserControl = "option1";

//Create a Pixi Application
let app = new PIXI.Application({antialias: true });
//Add the canvas that Pixi automatically created for you to the HTML document
worldContainer.append(app.view);
const graphics = new PIXI.Graphics();

//Something for cats/creatures to chase
class RedDot {
    constructor(room, vector)
    {
        this.room = room;
        this.position = vector;
        this.velocity = new Vector2d(0, 0, -10, 10);
    }

    draw() {
        graphics.lineStyle(2, 0xffa000); 
        graphics.beginFill(0xff0000);
        graphics.drawCircle(this.position.x + this.room.originX, this.position.y + this.room.originY, 4);
        graphics.endFill();
    }

    update () {
        let rebound = 10;
        //out of bounds check
        if (this.position.x > this.room.size-rebound){
            this.velocity.x = -this.velocity.x * 0.8;
            this.position.x -= 10;
        }
        if (this.position.y > this.room.size-rebound){
            this.velocity.y = -this.velocity.y * 0.8;
            this.position.y -= 10;
        }
        if (this.position.x < rebound){
            this.velocity.x  = -this.velocity.x * 0.8;
            this.position.x += 10;
        }
        if (this.position.y < rebound){
            this.velocity.y = -this.velocity.y * 0.8;
            this.position.y += 10;
        }


        const laserRadios = document.getElementsByName('laser-radios');
        for(let i = 0; i < laserRadios.length; i++) {
            if (i == 0 && laserRadios[i].checked) {
                let speed = $('#laser-speed').val();
                this.randomMove(speed);
                if (frameCount % 100 == 0){
                    this.velocity.set(0,0);
                    this.randomMove();
                }
                this.position.add(this.velocity);
            }
            if (i == 1 && laserRadios[i].checked)
                this.randomTeleport();
            if (i == 2 && laserRadios[i].checked) {
                this.position.x = mouseX-50;
                this.position.y = mouseY-50;
            }
            
        }

        this.draw();
    }

    randomMove (motion=1){
        this.velocity.x += (Math.random() - 0.5) * motion;
        this.velocity.y += (Math.random() - 0.5) * motion;
    }

    randomVibrate (motion=1){
        this.velocity.x = (Math.random() - 0.5) * motion;
        this.velocity.y = (Math.random() - 0.5) * motion;
    }

    randomTeleport () {
        this.position.x = rand(0, this.room.size);
        this.position.y = rand(0, this.room.size);
    }
}

//only cats for now
class Creature {
    constructor(room, vector, learningRate = 0.25){
        this.room = room;
        //sprite
        this.sprite = PIXI.Sprite.from('/learning-rooms/assets/images/Cat.png');
        this.sprite.anchor.set(0.5);
        this.sprite.x = vector.x;
        this.sprite.y = vector.y;
        this.sprite.width = 30;
        this.sprite.height = 30;
        app.stage.addChild(this.sprite);

        this.position = vector.getCopy();
        this.velocity = new Vector2d(0, 0, -3, 3);
        this.accel = new Vector2d(0, 0, -0.1, 0.1);
        this.learningRate = learningRate;
        this.fitness = 0;
        //Basic Feedforward NN
        this.network = new Architect.Perceptron(2, 5, 5, 2);
    }

    draw() {
        graphics.lineStyle(1, 0xffffff); 
        graphics.drawCircle(this.position.x + this.room.originX, this.position.y + this.room.originY, 1);
        graphics.endFill();
    }

    update() {
        //console.log(this.network);

        //get this room's size and its red dot
        const roomSize = this.room.size;
        const redDot = this.room.redDot; 
        
        //normalize positions by room size (for NN inputs)
        const input = [(redDot.position.x / roomSize), (redDot.position.y / roomSize)];
                   //(this.position.x / roomSize), (redDot.position.y / roomSize)];
        const output = this.network.activate(input);

        //the vector to be changed by output, such as velocity or accel
        const changing = this.accel; 

        //update creature's acceleration from output
        changing.x = output[0] > 0.5 ? output[0] : output[0] - 1;
        changing.y = output[1] > 0.5 ? output[1] : output[1] - 1;
        //console.log("Change");
        //console.log(changing);

        // find intended output so NN can learn
        const intendedX = this.position.x > redDot.position.x ? 0 : 1;
        const intendedY = this.position.y > redDot.position.y ? 0 : 1;
        const intendedOutput = [intendedX, intendedY];
        //console.log("intendedOutput");
        //console.log(intendedOutput);

        this.learningRate = this.room.learningRate;
        //train neural network
        //if (frameCount < learningPeriod)
        if ($('#learning-checkbox:checked').val())
            this.network.propagate(this.learningRate, intendedOutput);

        //add acceleration to velocity
        this.velocity.add(this.accel);
        //add velocity to position
        this.position.add(this.velocity);

        //out of bounds check
        const rebound = 5;
        if (this.position.x > this.room.size-rebound){
            this.velocity.x = -this.velocity.x;
            this.position.x -= rebound;
        }
        if (this.position.y > this.room.size-rebound){
            this.velocity.y = -this.velocity.y;
            this.position.y -= rebound;
        }
        if (this.position.x < rebound){
            this.velocity.x  = -this.velocity.x;
            this.position.x += rebound;
        }
        if (this.position.y < rebound){
            this.velocity.y = -this.velocity.y;
            this.position.y += rebound;
        }

        //set sprite x & y to position
        this.sprite.x = this.position.x + this.room.originX;
        this.sprite.y = this.position.y + this.room.originY;
        this.draw();

        //reward
        //var distance = this.position.distance(redDot.position);
        //this.fitness += 1 / (distance+1);
        this.fitness += this.position.x + this.position.y;
    }

    mutate(rate, scale = 2) {
        var net = this.network;
        //mutate weights from input
        for (var j in net.layers.input.list){
            for (var k in net.layers.input.list[j].connections.projected) {
                if (rate > Math.random()) {
                    net.layers.input.list[j].connections.projected[k].to.bias = (Math.random()-0.5) * scale;
                    net.layers.input.list[j].connections.projected[k].weight = (Math.random()-0.5) * scale;
                }
            }
        }
        
        //mutate weights from hidden layers       
        for (var i = 0; i < net.layers.hidden.length; i++){
            for (var j in net.layers.hidden[i].list){
                for (var k in net.layers.hidden[i].list[j].connections.projected){
                    if (rate > Math.random()){
                        net.layers.hidden[i].list[j].connections.projected[k].to.bias = (Math.random()-0.5) * scale;
                        net.layers.hidden[i].list[j].connections.projected[k].weight = (Math.random()-0.5) * scale;
                    }
                }
            }
        }
    }

    replace() {}
}

//isolated 'ecosystems'
class Room {
    constructor(name, floor, rangeSlider, originX, originY, size, pop){

        //floor image
        this.floor = PIXI.Sprite.from(floor);
        this.floor.width = size;
        this.floor.height = size;
        this.floor.x = originX;
        this.floor.y = originY;
        app.stage.addChild(this.floor);

        //range slider in controls
        this.rangeSlider = rangeSlider;

        this.originX = originX;
        this.originY = originY;
        this.maxX = originX + size;
        this.maxY = originY + size;
        this.size = size;

        this.pop = pop; //population
        this.creatures = new Array(pop);
        for (var c = 0; c < pop; c++)
            this.creatures[c] = new Creature(this, new Vector2d(rand(0, size), rand(0, size))); //random positions

        this.redDot = new RedDot(this, new Vector2d((size)/2, (size)/2));
    }

    update() {
        this.learningRate = this.rangeSlider.val();

        this.redDot.update();
        for (var c=0; c < this.pop; c++) 
            this.creatures[c].update();

        this.draw();
        //TODO: Fix genetic algorithm
        //if (frameCount % generationLength == 0)
        //    this.genetics();
    }

    draw() {
        graphics.lineStyle(2, 0x800000); 
        //graphics.beginFill(0xff0000);
        graphics.drawRoundedRect(this.originX, this.originY, this.size, this.size, 10);
        graphics.endFill();
    }

    //TODO: Debug genetic algorithm
    genetics() {
        //fitness sorting, more fit creatures move to front
        this.creatures.sort((b, a) => (a.fitness > b.fitness) ? 1 : -1);
        
        //the better the fitness, the lower the mutation rate
        for (var c=0; c < this.pop; c++) {
            this.creatures[c].mutate((c+1) / this.pop);
            this.creatures[c].fitness = 0;
        }

        this.pop = this.creatures.length;
    }

}

//cat converges on the red dot in the middle of the room
function worldLoop(delta){
    if (frameCount % fpsReduction === 0) {
        graphics.clear();
        for (var i=0; i < numRooms; i++){
            rooms[i].update();
        }
    }
    frameCount++;
    //$('#controls').text(frameCount);
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
    //create rooms
    var margin = 1.3;
    for (var i=0, col=0, row=0; i < numRooms; i++) {
        var originX = roomSize * col * margin;
        var originY = roomSize * row * margin;

        var rangeContainer = rangeContainerPrototype.clone();
        rangeContainer.attr("id", "learning-rate" + roomNames[i]);
        rangeContainer.children().eq(0).text("Room " + roomNames[i] + " Learning Rate")
        rangeContainer.appendTo('#controls');
        var rangeSlider = rangeContainer.children().eq(1);
        rangeSlider.attr("value", (i+0.1)/6)
        console.log(rangeContainer.children().eq(1));
        rooms.push(new Room(roomNames[i], roomFloors[i % roomFloors.length], rangeContainer.children().eq(1), originX+50, originY+50, roomSize, initialPop));
        col++;
        if (originX > 400) {
            col = 0;
            row++;
        }
    }
    rangeContainerPrototype.remove();
    //send worldLoop to Pixi ticker
}

start();

app.ticker.add(delta => worldLoop(delta));
app.stage.addChild(graphics);