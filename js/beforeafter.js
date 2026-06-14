const slider = document.getElementById("slider");
const after = document.querySelector(".after");
const divider = document.querySelector(".divider");

slider.addEventListener("input", () => {

    after.style.width = slider.value + "%";
    divider.style.left = slider.value + "%";

});
