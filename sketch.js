var grid;
var next;

var feedSlider;
var kSlider;
var DaSlider;
var DbSlider;

var run = 1;
var showParams = 0;

var sizex;
var sizey;

var Da = 1;
var Db = 0.5;
var feed = 0.055;
var k = 0.062;

var dt = 1;

var density = 4;

// pointSize = 4;

var kernel = [[0.05, 0.2, 0.05],
              [0.2,  -1,  0.2],
              [0.05, 0.2, 0.05]];


function drawPoint(x, y, pointSize = 4){
    x = int(x/density);
    y = int(y/density);
    if(x < sizex-pointSize && y < sizey-pointSize && x > pointSize && y > pointSize){
        for(var i = x - pointSize; i < x + pointSize && i < sizex && i >= 0; i++){
            for(var j = y - pointSize; j < y + pointSize && j < sizey && j >= 0; j++){
                grid[i][j].b = 1;
            }
        }
    }
}

function mousePressed(){
    print(mouseX, mouseY);
    drawPoint(mouseX, mouseY, 5);
}

function setup() {
    cnv = document.getElementById("Canvas");
    sizex = int(cnv.width/density);
    sizey = int(cnv.height/density);
    createCanvas(cnv.width, cnv.height, cnv);
    CanvasRenderingContext2D.willReadFrequently = true;
    pixelDensity(1);
    
    drawBorder(pixels);

    grid = [];
    next = [];
    for(var x = 0; x < sizex; x++){
        grid[x] = [];
        next[x] = [];
        for(var y = 0; y < sizey; y++){
            grid[x][y] = {a: 1, b: 0};
            next[x][y] = {a: 1, b: 0};
        }
    }


    for(var x = 50; x < 60; x++){
        for(var y = 50; y < 60; y++){
            grid[x][y].b = 1;
        }
    }

    
    document.getElementById("feed-v").innerHTML = feed;
    feedSlider = document.getElementById("feed-slider");
    feedSlider.oninput = function(){
        feed = 0.001 * feedSlider.value;
        document.getElementById("feed-v").innerHTML = feed;
    }
    document.getElementById("k-v").innerHTML = k;
    kSlider = document.getElementById("k-slider");
    kSlider.oninput = function(){
        k = 0.001 * kSlider.value;
        document.getElementById("k-v").innerHTML = k;
    }
    document.getElementById("Da-v").innerHTML = Da;
    DaSlider = document.getElementById("Da-slider");
    DaSlider.oninput = function(){
        Da = 0.1 * DaSlider.value;
        document.getElementById("Da-v").innerHTML = Da;
    }
    document.getElementById("Db-v").innerHTML = Db;
    DbSlider = document.getElementById("Db-slider");
    DbSlider.oninput = function(){
        Db = 0.1 * DbSlider.value;
        document.getElementById("Db-v").innerHTML = Db;
    }
}

function draw() {
    background(51);
    
    document.getElementById("feed-v").innerHTML = feed;
    document.getElementById("feed-slider").value = feed/0.001;
    document.getElementById("k-v").innerHTML = k;
    document.getElementById("k-slider").value = k/0.001;
    document.getElementById("Da-v").innerHTML = Da;
    document.getElementById("Da-slider").value = Da/0.1;
    document.getElementById("Db-v").innerHTML = Db;
    document.getElementById("Db-slider").value = Db/0.1;

    if(run){
    for(var x = 1; x < sizex-1; x++){
            for(var y = 1; y < sizey-1; y++){
                var a = grid[x][y].a;
                var b = grid[x][y].b;
                next[x][y].a = a + ((Da*laplaceA(x, y)) - (a*b*b) + (feed*(1-a)))*dt;
                next[x][y].b = b + ((Db*laplaceB(x, y)) + (a*b*b) - ((k+feed)*b))*dt;

                next[x][y].a = constrain(next[x][y].a, 0, 1);
                next[x][y].b = constrain(next[x][y].b, 0, 1);
            }
        }
    }

    loadPixels();
    for(var x = 1; x < sizex-1; x++){
        for(var y = 1; y < sizey-1; y++){
            var a = next[x][y].a;
            var b = next[x][y].b;
            var c = floor((a-b)*255);
            c = constrain(c, 0, 255);

            for(var k1 = 0; k1 < density; k1++){
                for(var k2 = 0; k2 < density; k2++){
                    var pix = pos(x*density+k1, y*density+k2);
                    pixels[pix + 0] = c;
                    pixels[pix + 1] = c;
                    pixels[pix + 2] = c;
                    pixels[pix + 3] = 255;
                }
            }
            
        }
    }
    updatePixels();

    grid = next;

    if(showParams){
        let fps = frameRate();
        text("fps: " + fps, 0, 15);
        text("feed: " + feed, 0, 30); // 0.066
        text("K: " + k, 0, 45); // 0.02
        text("Da: " + Da, 0, 60); // 2.1
        text("Db: " + Db, 0, 75); // 2.2
    }
}

function drawBorder(pixels){
    for(var x = 0; x < width; x++){
        var pix = pos(x, 0);
        pixels[pix+0] = 0;
        pixels[pix+1] = 0;
        pixels[pix+2] = 0;
        pixels[pix+3] = 255;
        pix = pos(x, height-1);
        pixels[pix+0] = 0;
        pixels[pix+1] = 0;
        pixels[pix+2] = 0;
        pixels[pix+3] = 255;
    }
    for(var y = 0; y < height; y++){
        var pix = pos(0, y);
        pixels[pix+0] = 0;
        pixels[pix+1] = 0;
        pixels[pix+2] = 0;
        pixels[pix+3] = 255;
        pix = pos(width-1, y);
        pixels[pix+0] = 0;
        pixels[pix+1] = 0;
        pixels[pix+2] = 0;
        pixels[pix+3] = 255;
    }
}

function pos(x, y){
    return (x + y * width) * 4;
}

function edge(x, y){
    if(x == 0) return 1;
    if(x == height-1) return 1;
    if(y == 0) return 1;
    if(y == width-1) return 1;
    return 0;
}

function laplaceA(x, y) {
    var sum = 0;
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            if(!edge(x, y)){
                sum += grid[x+i-1][y+j-1].a * kernel[i][j];
            }
            // sum += grid[x+i-1][y+j-1].a * kernel[i][j];
        }
    }
    return sum;
}

function laplaceB(x, y) {
    var sum = 0;
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < 3; j++){
            if(!edge(x, y)){
                sum += grid[x+i-1][y+j-1].b * kernel[i][j];
            }
            // sum += grid[x+i-1][y+j-1].b * kernel[i][j];
        }
    }
    return sum;
}

function toggleRun(){
    run = !run;
}

function clearCanvas(){
    for(var x = 0; x < sizex; x++){
        for(var y = 0; y < sizey; y++){
            grid[x][y] = {a: 1, b: 0};
        }
    }
}
function reset(){
    feed = 0.055;
    k = 0.062;
    Da = 1;
    Db = 0.5;
}


function zebraWaves(){
    feed = 0.066;
    k = 0.02;
    Da = 2.1;
    Db = 2.2;
}
function singleWaves(){
    reset();
    Db = 1.5;
}
function tunnels(){
    reset();
    for(var x = 0; x < sizex; x++){
        for(var y = 0; y < sizey; y++){
            grid[x][y] = {a: 1, b: 1};
        }
    }
    Da = 0.4;
    Db = 1.5;
}
function worms(){
    reset();
    Da = 0.4;
    Db = 1.5;

    drawPoint(int(0.5*width), int(0.5*height));
    drawPoint(int(0.75*width), int(0.75*height));
    // drawPoint(int(0.75*sizex), int(0.25*sizey));
}
function selfRegulating(){
    feed = 0.1;
    k = 0.045;
    Da = 1.2;
    Db = 2.5;
}
function pixelated(){
    feed = 0.059;
    k = 0.042;
    Da = 2.9;
    Db = 7.5;
}