const slider = document.getElementById("slider");
const after = document.querySelector(".after");
const divider = document.querySelector(".divider");

slider.addEventListener("input", function(){

    after.style.width = this.value + "%";
    divider.style.left = this.value + "%";

});

const faders = document.querySelectorAll('.fade');

window.addEventListener('scroll', () => {

faders.forEach(el => {

const top = el.getBoundingClientRect().top;

if(top < window.innerHeight - 100){
el.classList.add('show');
}

});

});
