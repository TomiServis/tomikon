const slider = document.getElementById("slider");
const after = document.querySelector(".after");

if(slider && after){

slider.addEventListener("input", function(){

after.style.width = this.value + "%";

});

}
