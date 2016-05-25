/**
 * Created by jack on 5/25/16.
 */

const WIDTH = 720;
const HEIGHT = 600;
const SCALE = 4;
const BGCOLOR = 0;
const FPS = 60;

var gameport = document.getElementByID("gameport");
var renderer = new PIXI.autoDetectRenderer(WIDTH, HEIGHT, {backgroundColor: BGCOLOR});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container({backgroundColor: BGCOLOR});
stage.scale.x = SCALE;
stage.scale.y = SCALE;

function Hero() {

}

function keydown(e) {

}

function keyup(e) {

}
stage.addEventListener("keydown", keydown);
stage.addEventListener("keyup", keyup);

function animate() {
    setTimeout(function () {requestAnimationFrame(animate);}, 1000/FPS);

    renderer.render(stage);
}

animate();