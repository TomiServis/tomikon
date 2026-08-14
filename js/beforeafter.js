// SLIDER
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

        afterImg.style.width = beforeAfter.clientWidth + "px";
        afterImg.style.height = beforeAfter.clientHeight + "px";

    }

    updateSlider();

    slider.addEventListener("input", updateSlider);

    window.addEventListener("resize", updateSlider);

}

/* =========================
   MOBILNÉ OVLÁDANIE SLIDERA
   ========================= */

if (beforeAfter && slider && after && line) {

    let startX = 0;
    let startY = 0;
    let dragging = false;

    beforeAfter.addEventListener("touchstart", function(e){

        if (e.touches.length !== 1) return;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        dragging = false;

    }, {passive:true});


    beforeAfter.addEventListener("touchmove", function(e){

        if (e.touches.length !== 1) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;

        const diffX = currentX - startX;
        const diffY = currentY - startY;

        /* ešte nevieme, či chce scrollovať alebo slider */
        if (!dragging && Math.abs(diffX) < 8 && Math.abs(diffY) < 8) {
            return;
        }

        /* ak ide viac hore/dole → necháme telefón scrollovať */
        if (!dragging && Math.abs(diffY) > Math.abs(diffX)) {
            return;
        }

        /* vodorovný pohyb = slider */
        if (Math.abs(diffX) > Math.abs(diffY)) {

            dragging = true;

            e.preventDefault();

            const rect = beforeAfter.getBoundingClientRect();

            let value =
                ((currentX - rect.left) / rect.width) * 100;

            value = Math.max(0, Math.min(100, value));

            slider.value = value;

            after.style.width = value + "%";
            line.style.left = value + "%";
        }

    }, {passive:false});


    beforeAfter.addEventListener("touchend", function(){

        dragging = false;

    }, {passive:true});

}


// ĎALEJ UŽ TVOJ PÔVODNÝ KÓD

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
