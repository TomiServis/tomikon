const slider = document.getElementById("slider");
const after = document.querySelector(".after");
const line = document.getElementById("line");

slider.addEventListener("input", () => {
    after.style.width = slider.value + "%";
    line.style.left = slider.value + "%";
});
