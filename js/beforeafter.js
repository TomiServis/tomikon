const slider = document.getElementById("slider");
const beforeAfter = document.querySelector(".before-after");
const after = document.querySelector(".after");
const line = document.querySelector(".slider-line");

let startX = 0;
let startY = 0;
let dragging = false;

function updateSlider(clientX){

const rect = beforeAfter.getBoundingClientRect();

let percent =
((clientX - rect.left) / rect.width) * 100;

percent = Math.max(0, Math.min(100, percent));

slider.value = percent;

after.style.width = percent + "%";
line.style.left = percent + "%";

}

beforeAfter.addEventListener("pointerdown", (e) => {

startX = e.clientX;
startY = e.clientY;

dragging = false;

});

beforeAfter.addEventListener("pointermove", (e) => {

const moveX = Math.abs(e.clientX - startX);
const moveY = Math.abs(e.clientY - startY);

if(!dragging){

if(moveX < 10 && moveY < 10){
return;
}

/* pohyb hore/dole = normálny scroll */

if(moveY > moveX){
return;
}

/* pohyb doľava/doprava = slider */

dragging = true;

}

if(dragging){

e.preventDefault();

updateSlider(e.clientX);

}

}, {passive:false});

beforeAfter.addEventListener("pointerup", () => {

dragging = false;

});

beforeAfter.addEventListener("pointercancel", () => {

dragging = false;

});

slider.value = 50;
after.style.width = "50%";
line.style.left = "50%";

const faders = document.querySelectorAll('.fade');

window.addEventListener('scroll', () => {

faders.forEach(el => {

const top = el.getBoundingClientRect().top;

if(top < window.innerHeight - 100){
el.classList.add('show');
}

});
    
});

const results = document.querySelector('.results');

function animateCounter(el, target){

let current = 0;

const timer = setInterval(() => {

current += Math.ceil(target / 40);

if(current >= target){
current = target;
clearInterval(timer);
}

el.innerText = current + '°C';

},25);

}

function animateRange(id,target){

let el=document.getElementById(id);
let count=0;

const timer=setInterval(()=>{

count++;

el.textContent=count;

if(count>=target){
clearInterval(timer);
}

},25);

}

function startAnimation(){

document.querySelector('.before-temp').innerText='0°C';

document.getElementById('minTemp').textContent='0';
document.getElementById('maxTemp').textContent='0';

document.getElementById('minDrop').textContent='0';
document.getElementById('maxDrop').textContent='0';

animateCounter(document.querySelector('.before-temp'),89);

animateRange("minTemp",65);
animateRange("maxTemp",72);

animateRange("minDrop",17);
animateRange("maxDrop",24);

}

const observer = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

startAnimation();

}

});

},{
threshold:0.5
});

observer.observe(results);
