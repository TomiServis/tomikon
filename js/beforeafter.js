const slider = document.getElementById("slider");
const after = document.querySelector(".after");
const divider = document.querySelector(".divider");

slider.addEventListener("input", function(){

    after.style.width = this.value + "%";
    divider.style.left = this.value + "%";

});
