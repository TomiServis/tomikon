// =========================================
// BEFORE / AFTER SLIDER
// =========================================

const slider = document.getElementById("slider");
const after = document.querySelector(".before-after .after");
const line = document.querySelector(".before-after .slider-line");
const beforeAfter = document.querySelector(".before-after");
const afterImg = document.querySelector(".before-after .after img");

if (slider && after && line && beforeAfter && afterImg) {

    // -----------------------------------------
    // GULIČKA
    // -----------------------------------------

    let handle = document.querySelector(".slider-handle");

if (window.matchMedia("(max-width: 768px)").matches) {

    if (!handle) {
        handle = document.createElement("div");
        handle.className = "slider-handle";
        beforeAfter.appendChild(handle);
    }

    handle.style.position = "absolute";
    handle.style.top = "18px";
    handle.style.width = "22px";
    handle.style.height = "22px";
    handle.style.borderRadius = "50%";
    handle.style.background = "#008cff";
    handle.style.border = "3px solid white";
    handle.style.boxShadow = "0 0 12px #008cff, 0 0 25px #008cff";
    handle.style.transform = "translateX(-50%)";
    handle.style.zIndex = "50";
    handle.style.pointerEvents = "auto";
    handle.style.touchAction = "none";
    handle.style.cursor = "ew-resize";

}

    // základný vzhľad guličky
    handle.style.position = "absolute";
    handle.style.top = "18px";
    handle.style.width = "22px";
    handle.style.height = "22px";
    handle.style.borderRadius = "50%";
    handle.style.background = "#008cff";
    handle.style.border = "3px solid white";
    handle.style.boxShadow = "0 0 12px #008cff, 0 0 25px #008cff";
    handle.style.transform = "translateX(-50%)";
    handle.style.zIndex = "50";
    handle.style.pointerEvents = "auto";
    handle.style.touchAction = "none";
    handle.style.cursor = "ew-resize";


    // -----------------------------------------
    // NASTAVENIE SLIDERA
    // -----------------------------------------

    function updateSlider() {

        let value = parseFloat(slider.value);

        if (isNaN(value)) {
            value = 50;
        }

        value = Math.max(0, Math.min(100, value));

        slider.value = value;

        // šírka hornej vrstvy
        after.style.width = value + "%";

        // modrá čiara
        line.style.left = value + "%";

        // gulička
        handle.style.left = value + "%";


        // -------------------------------------
        // DÔLEŽITÉ:
        // obrázok musí mať veľkosť CELÉHO boxu
        // -------------------------------------

        const width = beforeAfter.clientWidth;
        const height = beforeAfter.clientHeight;

        afterImg.style.width = width + "px";
        afterImg.style.height = height + "px";
        afterImg.style.maxWidth = "none";


        // na desktopoch necháme aj natívny slider
        slider.setAttribute("aria-valuenow", value);
    }


    updateSlider();


    // -----------------------------------------
    // DESKTOP RANGE SLIDER
    // -----------------------------------------

    slider.addEventListener("input", updateSlider);


    // -----------------------------------------
    // RESIZE
    // -----------------------------------------

    window.addEventListener("resize", updateSlider);


    // =========================================
    // MOBILE DOTYKOVÉ OVLÁDANIE
    // =========================================

    let startX = 0;
    let startY = 0;
    let dragging = false;
    let horizontalDrag = false;


    function isMobile() {
        return window.matchMedia("(max-width: 768px)").matches;
    }


    function setSliderFromX(clientX) {

        const rect = beforeAfter.getBoundingClientRect();

        let x = clientX - rect.left;

        let value = (x / rect.width) * 100;

        value = Math.max(0, Math.min(100, value));

        slider.value = value;

        updateSlider();
    }


    // -----------------------------------------
    // DOTYK NA GULIČKE
    // -----------------------------------------

    handle.addEventListener("pointerdown", function(e) {

        if (!isMobile()) return;

        dragging = true;
        horizontalDrag = true;

        handle.setPointerCapture(e.pointerId);

        e.preventDefault();
        e.stopPropagation();

    });


    handle.addEventListener("pointermove", function(e) {

        if (!dragging || !isMobile()) return;

        setSliderFromX(e.clientX);

        e.preventDefault();

    });


    handle.addEventListener("pointerup", function(e) {

        dragging = false;
        horizontalDrag = false;

        try {
            handle.releasePointerCapture(e.pointerId);
        } catch(err) {}

    });


    handle.addEventListener("pointercancel", function() {

        dragging = false;
        horizontalDrag = false;

    });


    // =========================================
    // DOTYK KDEKOĽVEK NA SLIDRI
    // =========================================

    beforeAfter.addEventListener("pointerdown", function(e) {

        if (!isMobile()) return;

        // ak klikne priamo na guličku,
        // rieši ju jej vlastný handler
        if (e.target === handle) return;

        startX = e.clientX;
        startY = e.clientY;

        dragging = true;
        horizontalDrag = false;

    });


    beforeAfter.addEventListener("pointermove", function(e) {

        if (!isMobile() || !dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        // ešte nevieme, či používateľ
        // chce scrollovať alebo slider
        if (!horizontalDrag) {

            // čakáme na trochu väčší pohyb
            if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
                return;
            }

            // ak je pohyb viac vertikálny,
            // pustíme scroll stránky
            if (Math.abs(dy) > Math.abs(dx)) {

                dragging = false;
                return;
            }

            // horizontálny pohyb = slider
            horizontalDrag = true;
        }


        if (horizontalDrag) {

            setSliderFromX(e.clientX);

            // zabránime posúvaniu stránky
            // iba počas horizontálneho slidera
            e.preventDefault();

        }

    }, { passive: false });


    beforeAfter.addEventListener("pointerup", function() {

        dragging = false;
        horizontalDrag = false;

    });


    beforeAfter.addEventListener("pointercancel", function() {

        dragging = false;
        horizontalDrag = false;

    });

}


// =========================================
// FADE ANIMÁCIE
// =========================================

const faders = document.querySelectorAll(".fade");

window.addEventListener("scroll", () => {

    faders.forEach(el => {

        const top = el.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {
            el.classList.add("show");
        }

    });

}, { passive: true });


// =========================================
// VÝSLEDKY
// =========================================

const results = document.querySelector(".results");

function animateCounter(el, target) {

    if (!el) return;

    let current = 0;

    const timer = setInterval(() => {

        current += Math.ceil(target / 40);

        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        el.innerText = current + "°C";

    }, 25);

}


function animateRange(id, target) {

    const el = document.getElementById(id);

    if (!el) return;

    let count = 0;

    const timer = setInterval(() => {

        count++;

        el.textContent = count;

        if (count >= target) {
            clearInterval(timer);
        }

    }, 25);

}


function startAnimation() {

    const beforeTemp = document.querySelector(".before-temp");

    if (beforeTemp) {
        beforeTemp.innerText = "0°C";
    }

    const minTemp = document.getElementById("minTemp");
    const maxTemp = document.getElementById("maxTemp");
    const minDrop = document.getElementById("minDrop");
    const maxDrop = document.getElementById("maxDrop");

    if (minTemp) minTemp.textContent = "0";
    if (maxTemp) maxTemp.textContent = "0";
    if (minDrop) minDrop.textContent = "0";
    if (maxDrop) maxDrop.textContent = "0";

    animateCounter(beforeTemp, 89);

    animateRange("minTemp", 65);
    animateRange("maxTemp", 72);

    animateRange("minDrop", 17);
    animateRange("maxDrop", 24);
}


// =========================================
// INTERSECTION OBSERVER
// =========================================

if (results) {

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                startAnimation();
            }

        });

    }, {
        threshold: 0.5
    });

    observer.observe(results);
}
