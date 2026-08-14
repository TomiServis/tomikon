const slider = document.getElementById("slider");
const after = document.querySelector(".after");
const line = document.querySelector(".slider-line");
const beforeAfter = document.querySelector(".before-after");
const afterImg = document.querySelector(".after img");

if (slider && after && line && beforeAfter && afterImg) {

    function updateSlider() {

        const value = slider.value;

        after.style.width = value + "%";
        line.style.left = value + "%";

        // obrázok v .after musí mať veľkosť
        // celého kontajnera
        afterImg.style.width = beforeAfter.clientWidth + "px";
        afterImg.style.height = beforeAfter.clientHeight + "px";
    }

    updateSlider();

    slider.addEventListener("input", updateSlider);

    window.addEventListener("resize", updateSlider);
}

after.style.width = slider.value + "%";
line.style.left = slider.value + "%";

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
