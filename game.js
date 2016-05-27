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
const MUTE_BTN = 77;

function randint(min, max) {
    return Math.floor(Math.random() * max) + min;
}

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

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

var instructionsScreen = new PIXI.Container();
instructionsScreen.visible = false;
stage.addChild(instructionsScreen);
var instructionText = new PIXI.Text("A mean rectangle abandoned Triangly in this huge\nand poorly-drawn maze!\nThere's got to be a way out...\nIf only someone could help Triangly find a map!\nAnd also help him read it...\nGuide Triangly around using either\nthe arrow keys or the w, a, s, and d keys.", {fill: 0xffffff, align:"center"});
instructionText.anchor.set(0.5, 0.5);
instructionText.position.set(WIDTH/2, 250);
instructionsScreen.addChild(instructionText);
var exitText = new PIXI.Text("BACK", {fill: 0xffffff, align:"center"});
exitText.interactive = true;
exitText.on("mousedown", function () {toScreen("menu")});
exitText.anchor.set(0.5, 0.5);
exitText.position.set(WIDTH/2, HEIGHT-50);
instructionsScreen.addChild(exitText);
var promiseText = new PIXI.Text("There really is a map in there somewhere,\nI promise!", {fill: 0xffffff, align: "center", font: "bold 10px Ariel"});
promiseText.anchor.set(0.5, 0.5);
promiseText.position.set(WIDTH/2, HEIGHT-150);
instructionsScreen.addChild(promiseText);

var menuScreen = new PIXI.Container();
menuScreen.visible = false;
stage.addChild(menuScreen);
var playText = new PIXI.Text("PLAY", {fill: 0xffffff, align: "center"});
playText.position.set(10, HEIGHT-50);
playText.interactive = true;
playText.on('mousedown', function() {toScreen('game');});
menuScreen.addChild(playText);
var goInstructions = new PIXI.Text("INSTRUCTIONS", {fill: 0xffffff, align: "center"});
goInstructions.position.set(WIDTH-goInstructions.width-10, HEIGHT-50);
goInstructions.interactive = true;
goInstructions.on('mousedown', function() {toScreen('instructions');});
menuScreen.addChild(goInstructions);
var titleText = new PIXI.Text("Stuck!", {fill: 0xffffff, align: "center", font: 'bold 60px Ariel'});
titleText.anchor.set(0.5, 0.5);
titleText.position.set(WIDTH/2, 50);
menuScreen.addChild(titleText);

var mapFoundScreen = new PIXI.Container();
mapFoundScreen.visible = false;
stage.addChild(mapFoundScreen);
var foundText = new PIXI.Text("You found the map!\n\nToo bad Triangly can't read maps!\nOr numbers...\nOr letters...\nHe's even more lost now...", {fill: 0xffffff, align: "center"});
foundText.anchor.set(0.5, 0.5);
foundText.position.set(WIDTH/2, HEIGHT/2);
mapFoundScreen.addChild(foundText);
var backButton = new PIXI.Text("BACK", {fill: 0xffffff, align: "center"});
backButton.anchor.set(0.5, 0.5);
backButton.position.set(WIDTH/2, HEIGHT-50);
backButton.interactive = true;
backButton.on('mousedown', function () {toScreen('game');});
mapFoundScreen.addChild(backButton);

var screens = [loadingScreen, gameScreen, instructionsScreen, menuScreen, mapFoundScreen];

function toScreen(screen) {
    for (var i = 0; i < screens.length; i++) {
        screens[i].visible = false;
    }
    stage.position.set(0, 0);
    if (screen == "menu") {
        menuScreen.visible = true;
    }
    else if (screen == "game") {
        gameScreen.visible = true;
    }
    else if (screen == "instructions") {
        instructionsScreen.visible = true;
    }
    else if (screen == "found") {
        mapFoundScreen.visible = true;
    }
}

var map;
var hero;
var key;
var walls;
var bgAudio;
var foundAudio;
var muted = false;
var tu = new TileUtilities(PIXI);

PIXI.loader
    .add('map_json', 'map.json')
    .add('tiles', 'tiles.png')
    .add('assets.json')
    .add('mapFound.mp3')
    .add('background.mp3')
    .load(ready);

function ready() {
    var triangly = new PIXI.extras.MovieClip.fromFrames([
        "assets1.png", "assets2.png", "assets3.png", "assets2.png"
    ]);
    triangly.anchor.set(0.5, 0.5);
    triangly.position.set(WIDTH/2, HEIGHT/2);
    triangly.animationSpeed = 0.1;
    triangly.scale.set(4, 4);
    triangly.play();
    menuScreen.addChild(triangly);
    var tiles = [];
    for (var i = 0; i < 4; i++) {
        tiles.push(new PIXI.Sprite.fromImage("tiles2.png"));
        tiles[i].scale.set(4, 4);
        tiles[i].anchor.set(0.5, 0.5);
        menuScreen.addChild(tiles[i]);
    }
    tiles[0].position.set(WIDTH/2, HEIGHT/2-128);
    tiles[1].position.set(WIDTH/2, HEIGHT/2+128);
    tiles[2].position.set(WIDTH/2+128, HEIGHT/2);
    tiles[3].position.set(WIDTH/2-128, HEIGHT/2);

    map = tu.makeTiledWorld("map_json", "tiles.png");
    map.tileheight = 32;
    map.tilewidth = 32;
    map.widthInTiles = 61;
    gameScreen.addChild(map);

    walls = map.getObject("walls").data;

    hero = new Hero(gameScreen);
    key = new Key(gameScreen);

    bgAudio = PIXI.audioManager.getAudio("background.mp3");
    bgAudio.loop = true;
    bgAudio.play();
    foundAudio = PIXI.audioManager.getAudio("mapFound.mp3");

    toScreen("menu");
}

function Key(master) {
    this.master = master;
    this.container = new PIXI.Container();
    this.sprite = new PIXI.Sprite.fromImage("key.png");
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.position.set(16, 16);
    this.container.addChild(this.sprite);
    this.master.addChild(this.container);

    this.spawn = function() {
        var newX = randint(31, 60) * 32;
        var newY = randint(31, 60) * 32;
        while (walls[tu.getIndex(newX, newY, 32, 32, 61)] == 2) {
            newX = randint(31, 60) * 32;
            newY = randint(31, 60) * 32;
        }
        this.container.position.set(newX, newY);
        var outPos = new PIXI.Point(newX/32, newY/32);
        console.log(outPos)
    };
    this.spawn();
}

function Hero(master) {
    this.master = master;
    this.container = new PIXI.Container();
    this.container.width = 32;
    this.container.height = 32;
    this.master.addChild(this.container);
    this.standing = new PIXI.extras.MovieClip.fromFrames([
        "assets1.png", "assets2.png", "assets3.png", "assets2.png"
    ]);
    this.standing.anchor.set(0.5, 0.5);
    this.standing.position.set(16, 16);
    this.standing.visible = false;
    this.standing.animationSpeed = 0.1;
    this.container.addChild(this.standing);
    this.movingRight = new PIXI.extras.MovieClip.fromFrames([
        "assets8.png", "assets9.png"
    ]);
    this.movingRight.anchor.set(0.5, 0.5);
    this.movingRight.position.set(16, 16);
    this.movingRight.visible = false;
    this.movingRight.animationSpeed = 0.1;
    this.container.addChild(this.movingRight);
    this.movingLeft = new PIXI.extras.MovieClip.fromFrames([
        "assets10.png", "assets11.png"
    ]);
    this.movingLeft.anchor.set(0.5, 0.5);
    this.movingLeft.position.set(16, 16);
    this.movingLeft.visible = false;
    this.movingLeft.animationSpeed = 0.1;
    this.container.addChild(this.movingLeft);
    this.movingDown = new PIXI.extras.MovieClip.fromFrames([
        "assets4.png", 'assets5.png'
    ]);
    this.movingDown.anchor.set(0.5, 0.5);
    this.movingDown.position.set(16, 16);
    this.movingDown.visible = false;
    this.movingDown.animationSpeed = 0.1;
    this.container.addChild(this.movingDown);
    this.movingUp = new PIXI.extras.MovieClip.fromFrames([
        "assets6.png", 'assets7.png'
    ]);
    this.movingUp.anchor.set(0.5, 0.5);
    this.movingUp.position.set(16, 16);
    this.movingUp.visible = false;
    this.movingUp.animationSpeed = 0.1;
    this.container.addChild(this.movingUp);
    this.animations = [this.standing, this.movingRight, this.movingLeft, this.movingDown, this.movingUp];

    this.canMove = true;
    this.x = this.container.x+8;
    this.y = this.container.y+8;

    this.move = function(direction) {
        if (this.canMove) {
            var newDest = new PIXI.Point(this.container.x, this.container.y);
            for (var i = 0; i < this.animations.length; i++) {
                this.animations[i].visible = false;
                this.animations[i].stop();
            }
            if (direction == "standing") {
                this.standing.visible = true;
                this.standing.play();
            }
            else if (direction == "right") {
                this.movingRight.visible = true;
                //this.movingRight.scale.x = 1;
                this.movingRight.play();
                newDest.x += 32;
            }
            else if (direction == "left") {
                this.movingLeft.visible = true;
                //this.movingRight.scale.x = -1;
                this.movingLeft.play();
                newDest.x -= 32;
            }
            else if (direction == "up") {
                this.movingUp.visible = true;
                this.movingUp.play();
                newDest.y -= 32;
            }
            else if (direction == "down") {
                this.movingDown.visible = true;
                this.movingDown.play();
                newDest.y += 32;
            }
            if (walls[tu.getIndex(newDest.x, newDest.y, 32, 32, 61)] != 2) {
                this.canMove = false;
                var self = this;
                createjs.Tween.get(this.container).to({x: newDest.x, y: newDest.y}, 500).call(function () {
                    self.canMove = true;
                    self.x = self.container.x+8;
                    self.y = self.container.y+8;
                });
            }
        }
    };

    this.spawn = function() {
        var newX = randint(1, 30) * 32;
        var newY = randint(1, 30) * 32;
        while (walls[tu.getIndex(newX, newY, 32, 32, 61)] == 2) {
            newX = randint(1, 30) * 32;
            newY = randint(1, 30) * 32;
        }
        this.canMove = false;
        var self = this;
        createjs.Tween.get(this.container).to({x: newX, y: newY}, 500).call(function () {
            self.canMove = true;
            self.x = self.container.x+8;
            self.y = self.container.y+8;
        })
    };
    this.spawn();
}

var direction = {right: false, left: false, up: false, down: false};

function keydown(e) {
    e.preventDefault();
    if (RIGHT_BTNS.indexOf(e.keyCode) > -1) direction["right"] = true;
    else if (LEFT_BTNS.indexOf(e.keyCode) > -1) direction["left"] = true;
    else if (UP_BTNS.indexOf(e.keyCode) > -1) direction["up"] = true;
    else if (DOWN_BTNS.indexOf(e.keyCode) > -1) direction["down"] = true;
    else if (e.keyCode == MUTE_BTN) {
        muted = !muted;
        if (muted) {
            bgAudio.stop();
        }
        else {
            bgAudio.play();
        }
    }
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

function updateCamera() {
    stage.x = -hero.container.x*SCALE + WIDTH/2 - 16*SCALE;
    stage.y = -hero.container.y*SCALE + HEIGHT/2 - 16*SCALE;
    stage.x = -Math.max(0, Math.min(map.worldWidth*SCALE - WIDTH, -stage.x));
    stage.y = -Math.max(0, Math.min(map.worldHeight*SCALE - HEIGHT, -stage.y));
}

function animate() {
    setTimeout(function () {requestAnimationFrame(animate)}, 1000/FPS);
    if (gameScreen.visible) {
        updateCamera();
        if (hero.container.x == key.container.x && hero.container.y == key.container.y) {
            if (!muted) {
                foundAudio.play();
            }
            mapFoundScreen.position.set(0, -HEIGHT);
            toScreen("found");
            createjs.Tween.get(mapFoundScreen).to({x: 0, y: 0}, 500, createjs.Ease.bounceIn());
            key.spawn();
            hero.spawn();
        }
        if (direction["right"]) hero.move("right");
        if (direction["left"]) hero.move("left");
        if (direction["up"]) hero.move("up");
        if (direction["down"]) hero.move("down");
        if (direction["down"] == direction["up"] && direction["left"] == direction["right"]) hero.move("standing");
    }
    renderer.render(stage);
}

animate();