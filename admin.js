const SUPABASE_URL = "https://sjhlzllylobreeehziae.supabase.co";
const SUPABASE_KEY = "sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================
// PRIHLÁSENIE
// =========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const error =
            document.getElementById("error");

        error.textContent = "";

        const { error: loginError } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (loginError) {

            error.textContent =
                "Nesprávny e-mail alebo heslo.";

            return;
        }

        showAdmin();

    });

}


// =========================
// KONTROLA PRIHLÁSENIA
// =========================

async function checkUser() {

    const { data } =
        await supabaseClient.auth.getSession();

    if (data.session) {

        showAdmin();

    } else {

        showLogin();

    }

}


// =========================
// ZOBRAZENIE ADMINA
// =========================

function showAdmin() {

    document
        .getElementById("loginSection")
        .classList.add("hidden");

    document
        .getElementById("adminSection")
        .classList.remove("hidden");

    loadReviews();

}


function showLogin() {

    document
        .getElementById("loginSection")
        .classList.remove("hidden");

    document
        .getElementById("adminSection")
        .classList.add("hidden");

}


// =========================
// NAČÍTANIE VŠETKÝCH RECENZIÍ
// =========================

async function loadReviews() {

    const pendingContainer =
        document.getElementById("reviews");

    const approvedContainer =
        document.getElementById("approvedReviews");

    if (!pendingContainer || !approvedContainer) {

        console.error(
            "Chýba #reviews alebo #approvedReviews v admin.html"
        );

        return;
    }


    const { data, error } =
        await supabaseClient
        .from("reviews")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        pendingContainer.innerHTML =
            "<p>❌ Nepodarilo sa načítať recenzie.</p>";

        approvedContainer.innerHTML =
            "<p>❌ Nepodarilo sa načítať recenzie.</p>";

        console.error(error);

        return;
    }


    const pendingReviews =
        data.filter(review => review.approved === false);

    const approvedReviews =
        data.filter(review => review.approved === true);


    // =========================
    // POČTY
    // =========================

    const pendingCount =
        document.getElementById("pendingCount");

    const approvedCount =
        document.getElementById("approvedCount");


    if (pendingCount) {

        pendingCount.textContent =
            pendingReviews.length;

    }


    if (approvedCount) {

        approvedCount.textContent =
            approvedReviews.length;

    }


    // =========================
    // ČAKAJÚCE RECENZIE
    // =========================

    pendingContainer.innerHTML = "";


    if (pendingReviews.length === 0) {

        pendingContainer.innerHTML = `
            <div class="empty-reviews">
                🎉 Žiadne recenzie čakajúce na schválenie.
            </div>
        `;

    } else {

        pendingReviews.forEach(review => {

            pendingContainer.appendChild(
                createReviewCard(review, true)
            );

        });

    }


    // =========================
    // SCHVÁLENÉ RECENZIE
    // =========================

    approvedContainer.innerHTML = "";


    if (approvedReviews.length === 0) {

        approvedContainer.innerHTML = `
            <div class="empty-reviews">
                Zatiaľ nemáš žiadne schválené recenzie.
            </div>
        `;

    } else {

        approvedReviews.forEach(review => {

            approvedContainer.appendChild(
                createReviewCard(review, false)
            );

        });

    }

}


// =========================
// VYTVORENIE KARTY RECENZIE
// =========================

function createReviewCard(review, pending) {

    const card =
        document.createElement("div");

    card.className = "review-card";


    const stars =
        "★".repeat(Number(review.rating)) +
        "☆".repeat(5 - Number(review.rating));


    const title =
        pending
            ? "⏳ Čaká na schválenie"
            : "✅ Zverejnená";


    card.innerHTML = `

        <div class="review-status">
            ${title}
        </div>

        <h3>
            ${escapeHTML(review.name)}
        </h3>

        <div class="review-stars">
            ${stars}
        </div>

        <p class="review-text">
            "${escapeHTML(review.text)}"
        </p>

        <small>
            ${new Date(review.created_at)
                .toLocaleString("sk-SK")}
        </small>

        <div class="review-actions">

            ${
                pending
                ?
                `
                <button
                    class="approve-button"
                    onclick="approveReview(${review.id})">

                    ✅ Schváliť

                </button>
                `
                :
                ""
            }

            <button
                class="delete-button"
                onclick="deleteReview(${review.id})">

                🗑️ Zmazať

            </button>

        </div>
    `;


    return card;

}


// =========================
// SCHVÁLENIE
// =========================

async function approveReview(id) {

    const { error } =
        await supabaseClient
        .from("reviews")
        .update({
            approved: true
        })
        .eq("id", id);


    if (error) {

        alert(
            "Nepodarilo sa schváliť recenziu."
        );

        console.error(error);

        return;
    }


    await loadReviews();

}


// =========================
// ZMAZANIE
// =========================

async function deleteReview(id) {

    const confirmed =
        confirm(
            "Naozaj chceš túto recenziu zmazať?\n\nTáto akcia sa nedá vrátiť späť."
        );


    if (!confirmed) {

        return;

    }


    const { error } =
        await supabaseClient
        .from("reviews")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "Nepodarilo sa zmazať recenziu."
        );

        console.error(error);

        return;
    }


    await loadReviews();

}


// =========================
// ODHLÁSENIE
// =========================

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            await supabaseClient.auth.signOut();

            showLogin();

        }
    );

}


// =========================
// OCHRANA TEXTU
// =========================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;

}


// =========================
// SPUSTENIE
// =========================

checkUser();

// =========================
// TOMIKON AI - FOTKY
// =========================

const aiPhotos =
    document.getElementById("aiPhotos");

const aiPhotoPreview =
    document.getElementById("aiPhotoPreview");


if (aiPhotos) {

    aiPhotos.addEventListener("change", () => {

        aiPhotoPreview.innerHTML = "";

        const files =
            Array.from(aiPhotos.files);


        files.forEach(file => {

            const reader =
                new FileReader();


            reader.onload = function(event) {

                const wrapper =
                    document.createElement("div");

                wrapper.style.cssText = `
                    aspect-ratio:1;
                    border:1px solid #008cff;
                    border-radius:10px;
                    overflow:hidden;
                    background:#111;
                `;


                const img =
                    document.createElement("img");

                img.src =
                    event.target.result;

                img.style.cssText = `
                    width:100%;
                    height:100%;
                    object-fit:cover;
                    display:block;
                `;


                wrapper.appendChild(img);

                aiPhotoPreview.appendChild(wrapper);

            };


            reader.readAsDataURL(file);

        });

    });

}

// =========================
// TOMIKON AI - VLASTNÝ GENERÁTOR
// =========================

const generateAIButton =
    document.getElementById("generateAIButton");

if (generateAIButton) {

    generateAIButton.addEventListener("click", () => {

        const service =
            document.getElementById("aiService").value;

        const description =
            document.getElementById("aiDescription")
                .value
                .trim();

        const message =
            document.getElementById("aiMessage");

        const results =
            document.getElementById("aiResults");

        const loading =
            document.getElementById("aiLoading");

        const instagramResult =
            document.getElementById("instagramResult");

        const facebookResult =
            document.getElementById("facebookResult");


        // =========================
        // KONTROLA
        // =========================

        if (!description) {

            message.textContent =
                "❌ Napíš krátky popis toho, čo ste robili.";

            return;
        }


        generateAIButton.disabled = true;

        loading.style.display = "block";
        results.style.display = "none";

        message.textContent = "";


        // malé oneskorenie, aby to pôsobilo ako generovanie
        setTimeout(() => {

            const result =
                generateTomikonPost(
                    service,
                    description
                );


            instagramResult.value =
                result.instagram;

            facebookResult.value =
                result.facebook;


            results.style.display = "block";

            loading.style.display = "none";

            generateAIButton.disabled = false;

            message.textContent =
                "✅ TOMIKON AI vytvorila príspevky.";


        }, 700);

    });

}


// =========================
// TOMIKON AI ENGINE
// =========================

function generateTomikonPost(service, description) {

    const desc =
        description.charAt(0).toUpperCase() +
        description.slice(1);


    // =========================
    // ČISTENIE PC
    // =========================

    if (service === "Čistenie PC") {

        return {

            instagram: `🧹✨ Ďalší počítač dostal poriadny servis!

${desc}

Počítač sme dôkladne vyčistili od prachu a dali mu potrebnú starostlivosť. 💻

Čistý počítač znamená lepšie chladenie, správne teploty a spoľahlivejšiu prevádzku. ❄️🔥

Ak aj tvoj PC potrebuje vyčistiť, ozvi sa nám. 📩

⭐ TOMIKON – servis počítačov

#TOMIKON #PCservis #CisteniePC #GamingPC #Pocitac #ServisPC`,

            facebook: `🧹✨ Ďalší počítač dostal poriadny servis!

${desc}

Počítač sme dôkladne vyčistili a skontrolovali.

Pravidelné čistenie pomáha počítaču lepšie odvádzať teplo, udržiavať správne teploty a fungovať spoľahlivejšie.

Ak je tvoj počítač hlučný, prehrieva sa alebo je vo vnútri plný prachu, možno je čas na servis. 💻❄️

📩 Ozvi sa TOMIKONu a dohodneme servis.

⭐ TOMIKON – servis počítačov

#TOMIKON #PCservis #CisteniePC #ServisPC`
        };

    }


    // =========================
    // VÝMENA PASTY
    // =========================

    if (service === "Výmena teplovodivej pasty") {

        return {

            instagram: `🌡️🔥 Ďalší PC dostal novú teplovodivú pastu!

${desc}

Stará pasta už nemusí správne odvádzať teplo, čo môže spôsobovať vysoké teploty a hlučnejšie chladenie.

Po servise môže počítač opäť lepšie odvádzať teplo. ❄️💻

Potrebuje servis aj tvoj počítač?

📩 Ozvi sa TOMIKONu.

#TOMIKON #PCservis #TeplovodivaPasta #GamingPC #CPU #ServisPC`,

            facebook: `🌡️🔥 Dnes sme riešili teploty počítača.

${desc}

Súčasťou servisu bola výmena starej teplovodivej pasty.

Teplovodivá pasta pomáha odvádzať teplo medzi procesorom a chladičom. Ak je stará alebo vyschnutá, môže prispievať k vyšším teplotám.

Ak sa tvoj počítač prehrieva alebo je nezvyčajne hlučný, ozvi sa nám. 💻

📩 TOMIKON – servis počítačov

#TOMIKON #PCservis #TeplovodivaPasta #ServisPC`
        };

    }


    // =========================
    // KOMPLETNÝ SERVIS
    // =========================

    if (service === "Kompletný servis PC") {

        return {

            instagram: `⚙️🔥 Kompletný servis počítača!

${desc}

Počítač dostal kompletnú starostlivosť a kontrolu. 💻✨

Cieľom servisu je čistý, chladný a spoľahlivý počítač, ktorý bude pripravený na ďalšiu prácu alebo hranie. 🎮

Potrebuje servis aj tvoj PC?

📩 Ozvi sa TOMIKONu.

#TOMIKON #PCservis #ServisPC #GamingPC #Pocitac #CisteniePC`,

            facebook: `⚙️🔥 Kompletný servis počítača!

${desc}

Počítač sme kompletne skontrolovali a vykonali potrebný servis.

Pri kompletnom servise sa zameriavame na stav počítača, čistotu komponentov, chladenie a celkovú funkčnosť.

Ak chceš, aby tvoj počítač fungoval spoľahlivo a mal správne teploty, ozvi sa nám. 💻

📩 TOMIKON – servis počítačov

#TOMIKON #PCservis #ServisPC #GamingPC`
        };

    }


    // =========================
    // DIAGNOSTIKA
    // =========================

    if (service === "Diagnostika PC") {

        return {

            instagram: `🔍💻 Niečo nie je v poriadku s počítačom?

${desc}

Pri diagnostike hľadáme príčinu problému a kontrolujeme, čo môže spôsobovať nesprávne fungovanie počítača.

Niekedy stačí malá oprava, inokedy je potrebný väčší servis. Dôležité je najskôr zistiť, kde je problém. 🛠️

📩 Potrebuješ diagnostiku? Ozvi sa TOMIKONu.

#TOMIKON #PCservis #DiagnostikaPC #ServisPC #Pocitac`,

            facebook: `🔍💻 Počítač nefunguje tak, ako má?

${desc}

Pri diagnostike sa snažíme nájsť skutočnú príčinu problému.

Kontrolujeme jednotlivé komponenty, teploty, chladenie a ďalšie možné príčiny problémov.

Ak nevieš, čo je s tvojím počítačom, nemusíš hádať. Najskôr ho diagnostikujeme a následne navrhneme riešenie. 🛠️

📩 Ozvi sa TOMIKONu.

⭐ TOMIKON – servis počítačov

#TOMIKON #PCservis #DiagnostikaPC #ServisPC`
        };

    }


    // =========================
    // INÉ
    // =========================

    return {

        instagram: `💻✨ Novinka z TOMIKON servisu!

${desc}

O počítače sa treba starať, aby mohli spoľahlivo fungovať čo najdlhšie. 🛠️

Ak potrebuješ servis, kontrolu alebo pomoc s počítačom, ozvi sa nám. 📩

⭐ TOMIKON – servis počítačov

#TOMIKON #PCservis #Pocitac #ServisPC`,

        facebook: `💻✨ Novinka z TOMIKON servisu!

${desc}

Každý počítač si zaslúži správnu starostlivosť a pravidelnú kontrolu.

Ak potrebuješ pomoc s počítačom, servis, diagnostiku alebo čistenie, pokojne sa nám ozvi.

📩 TOMIKON – servis počítačov

#TOMIKON #PCservis #ServisPC`
    };

}


// =========================
// KOPÍROVANIE INSTAGRAM
// =========================

const copyInstagram =
    document.getElementById("copyInstagram");

if (copyInstagram) {

    copyInstagram.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "instagramResult"
                ).value;

            try {

                await navigator.clipboard.writeText(text);

                copyInstagram.textContent =
                    "✅ Skopírované!";

                setTimeout(() => {

                    copyInstagram.textContent =
                        "📋 Kopírovať Instagram";

                }, 1500);

            } catch (error) {

                console.error(error);

            }

        }
    );

}


// =========================
// KOPÍROVANIE FACEBOOK
// =========================

const copyFacebook =
    document.getElementById("copyFacebook");

if (copyFacebook) {

    copyFacebook.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "facebookResult"
                ).value;

            try {

                await navigator.clipboard.writeText(text);

                copyFacebook.textContent =
                    "✅ Skopírované!";

                setTimeout(() => {

                    copyFacebook.textContent =
                        "📋 Kopírovať Facebook";

                }, 1500);

            } catch (error) {

                console.error(error);

            }

        }
    );

}
