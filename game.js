/**
 * Created by jack on 5/25/16.
 */

const WIDTH = 720;
const HEIGHT = 600;
const SCALE = 4;
const BGCOLOR = 0;
const FPS = 60;

const RIGHT_BTNS = [39, 68];
const LEFT_BTNS = [37, 65];
const UP_BTNS = [38, 87];
const DOWN_BTNS = [40, 83];

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(WIDTH, HEIGHT, {backgroundColor: BGCOLOR});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();

var loadingScreen = new PIXI.Container();
stage.addChild(loadingScreen);
loadingScreen.position.set(0, 0);
loadingScreen.visible = true;
var loadingText = new PIXI.Text("LOADING...", {fill: 0xffffff});
loadingScreen.addChild(loadingText);
loadingText.position.set(0, HEIGHT-100);

var gameScreen = new PIXI.Container();
stage.addChild(gameScreen);
gameScreen.scale.set(SCALE, SCALE);
gameScreen.visible = false;

var map;
var hero;
var walls;
var tu = new TileUtilities(PIXI);

PIXI.loader
    .add('map_json', 'map.json')
    .add('tiles', 'tiles.png')
    .add('assets.json')
    .load(ready);

function ready() {
    loadingScreen.visible = false;

    map = tu.makeTiledWorld("map_json", "tiles.png");
    map.tileheight = 32;
    map.tilewidth = 32;
    map.widthInTiles = 61;
    gameScreen.addChild(map);

    walls = map.getObject("walls").data;
    console.log(walls);

    hero = new Hero(gameScreen, new PIXI.Point(32, 32));
    hero.move("standing");

    gameScreen.visible = true;
}

function Hero(master, pos) {
    this.master = master;
    this.container = new PIXI.Container();
    this.container.position = pos;
    this.master.addChild(this.container);
    this.standing = new PIXI.extras.MovieClip.fromFrames([
        "assets1 0.png", "assets1 1.png"
    ]);
    this.standing.anchor.set(0.5, 0.5);
    this.standing.position.set(16, 16);
    this.standing.visible = false;
    this.standing.animationSpeed = 0.1;
    this.container.addChild(this.standing);
    this.movingRight = new PIXI.extras.MovieClip.fromFrames([
        "assets1 2.png", "assets1 3.png", "assets1 4.png", "assets1 3.png"
    ]);
    this.movingRight.anchor.set(0.5, 0.5);
    this.movingRight.position.set(16, 16);
    this.movingRight.visible = false;
    this.movingRight.animationSpeed = 0.1;
    this.container.addChild(this.movingRight);
    this.movingLeft = new PIXI.extras.MovieClip.fromFrames([
        "assets1 2.png", 'assets1 3.png', 'assets1 4.png', 'assets1 3.png'
    ]);
    this.movingLeft.anchor.set(0.5, 0.5);
    this.movingLeft.position.set(16, 16);
    this.movingLeft.visible = false;
    this.movingLeft.scale.x = -1;
    this.movingLeft.animationspeed = 0.1;
    this.container.addChild(this.movingLeft);
    this.movingDown = new PIXI.extras.MovieClip.fromFrames([
        "assets1 5.png", 'assets1 6.png'
    ]);
    this.movingDown.anchor.set(0.5, 0.5);
    this.movingDown.position.set(16, 16);
    this.movingDown.visible = false;
    this.movingDown.animationSpeed = 0.1;
    this.container.addChild(this.movingDown);
    this.movingUp = new PIXI.extras.MovieClip.fromFrames([
        "assets1 7.png", 'assets1 8.png'
    ]);
    this.movingUp.anchor.set(0.5, 0.5);
    this.movingUp.position.set(16, 16);
    this.movingUp.visible = false;
    this.movingUp.animationSpeed = 0.1;
    this.container.addChild(this.movingUp);
    this.animations = [this.standing, this.movingRight, this.movingLeft, this.movingDown, this.movingUp];

    this.move = function(direction) {
        for (var i = 0; i < this.animations.length; i++) {
            this.animations[i].visible = false;
            this.animations[i].stop();
        }
        var velocity = 3;
        var dx = 0;
        var dy = 0;
        if (direction == "standing") {
            this.standing.visible = true;
            this.standing.play();
        }
        else if (direction == "right") {
            this.movingRight.visible = true;
            this.movingRight.play();
            dx = velocity;
        }
        else if (direction == "left") {
            this.movingLeft.visible = true;
            this.movingLeft.play();
            dx = -velocity
        }
        else if (direction == "up") {
            this.movingUp.visible = true;
            this.movingUp.play();
            dy = -velocity;
        }
        else if (direction == "down") {
            this.movingDown.visible = true;
            this.movingDown.play();
            dy = velocity;
        }
        if (!tu.hitTestTile(this.standing, walls, 2, map, "every").hit) {
            console.log("Hit");
            this.container.position.set(this.container.x+dx, this.container.y+dy);
        }
    }
}

var direction = {right: false, left: false, up: false, down: false};

function keydown(e) {
    e.preventDefault();
    if (RIGHT_BTNS.indexOf(e.keyCode) > -1) direction["right"] = true;
    else if (LEFT_BTNS.indexOf(e.keyCode) > -1) direction["left"] = true;
    else if (UP_BTNS.indexOf(e.keyCode) > -1) direction["up"] = true;
    else if (DOWN_BTNS.indexOf(e.keyCode) > -1) direction["down"] = true;
}

function keyup(e) {
    e.preventDefault();
    if (RIGHT_BTNS.indexOf(e.keyCode) > -1) direction["right"] = false;
    else if (LEFT_BTNS.indexOf(e.keyCode) > -1) direction["left"] = false;
    else if (UP_BTNS.indexOf(e.keyCode) > -1) direction["up"] = false;
    else if (DOWN_BTNS.indexOf(e.keyCode) > -1) direction["down"] = false;
}

window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

function animate() {
    setTimeout(function () {requestAnimationFrame(animate);}, 1000/FPS);
    if (gameScreen.visible) {
        if (direction["right"]) hero.move("right");
        if (direction["left"]) hero.move("left");
        if (direction["up"]) hero.move("up");
        if (direction["down"]) hero.move("down");
        if (direction["down"] == direction["up"] && direction["left"] == direction["right"]) hero.move("standing");
    }
    renderer.render(stage);
}

animate();