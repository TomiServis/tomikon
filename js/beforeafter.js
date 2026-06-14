const slider = document.getElementById("slider");
const after = document.querySelector(".after");
const divider = document.querySelector(".divider");

slider.addEventListener("input", () => {

    const value = slider.value;

    after.style.width = value + "%";
    divider.style.left = value + "%";

});
