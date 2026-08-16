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

    loadBazarAdmin();

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
setTimeout(async () => {

    const result =
        generateTomikonPost(
            service,
            description
        );

    instagramResult.value =
        result.instagram;

    facebookResult.value =
        result.facebook;


    // =========================
    // ULOŽENIE DO HISTÓRIE
    // =========================

    const { error: saveError } =
        await supabaseClient
            .from("ai_posts")
            .insert({
                service: service,
                description: description,
                instagram: result.instagram,
                facebook: result.facebook
            });


    if (saveError) {

        console.error(
            "AI HISTORY SAVE ERROR:",
            saveError
        );

    } else {

        console.log(
            "✅ TOMIKON AI príspevok uložený."
        );

        await loadAIHistory();

    }


    results.style.display = "block";

    loading.style.display = "none";

    generateAIButton.disabled = false;

    message.textContent =
        "✅ TOMIKON AI vytvorila príspevky.";


}, 700);

    });

}


// =========================
// TOMIKON AI PRO
// =========================

const aiStyles = [
    "professional",
    "sales",
    "social"
];


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


        if (!description) {

            message.textContent =
                "❌ Napíš krátky popis.";

            return;

        }


        generateAIButton.disabled = true;

        loading.style.display = "block";

        results.style.display = "none";

        message.textContent = "";


        setTimeout(async () => {

            const posts =
                generateTomikonAI(
                    service,
                    description
                );


            displayAIResults(posts);


            results.style.display = "block";

            loading.style.display = "none";

            generateAIButton.disabled = false;

            message.textContent =
                "✅ TOMIKON AI vytvorila 3 verzie.";

        }, 500);

    });

}


// =========================
// GENERÁTOR
// =========================

function generateTomikonAI(service, description) {

    const cleanDescription =
        capitalize(description);


    return {

        professional:
            createProfessionalPost(
                service,
                cleanDescription
            ),

        sales:
            createSalesPost(
                service,
                cleanDescription
            ),

        social:
            createSocialPost(
                service,
                cleanDescription
            )

    };

}


// =========================
// PROFESIONÁLNY
// =========================

function createProfessionalPost(
    service,
    description
) {

    const title =
        getServiceTitle(service);

    const hashtags =
        getHashtags(service);


    const instagram = `🔧 ${title}

${description}

Pri servise sme sa zamerali na dôkladnú kontrolu a potrebnú údržbu počítača.

Cieľom je spoľahlivý chod, správne teploty a čo najlepšia starostlivosť o hardware. 💻

📩 Potrebuješ servis alebo diagnostiku počítača?
Ozvi sa TOMIKONu.

${hashtags}`;


    const facebook = `🔧 ${title}

${description}

Pri tomto servise sme sa zamerali na dôkladnú údržbu a kontrolu počítača.

Správna starostlivosť o hardware môže pomôcť so stabilitou, chladením a celkovou spoľahlivosťou počítača. 💻

Ak aj tvoj počítač potrebuje servis, čistenie alebo diagnostiku, pokojne sa nám ozvi.

📩 TOMIKON – servis počítačov

${hashtags}`;


    return {
        instagram,
        facebook
    };

}


// =========================
// PREDAJNÝ
// =========================

function createSalesPost(
    service,
    description
) {

    const title =
        getServiceTitle(service);

    const hashtags =
        getHashtags(service);


    const instagram = `🔥 Ďalší PC dostal poriadny servis!

${description}

Aj tvoj počítač:

🌡️ sa prehrieva?
🔊 je hlučný?
🧹 je plný prachu?
⚡ alebo nefunguje tak ako má?

Nečakaj, kým sa problém zhorší.

📩 Napíš TOMIKONu a dohodni si servis.

${hashtags}`;


    const facebook = `🔥 Ďalší počítač je pripravený na ďalšiu prácu alebo hranie!

${description}

Ak máš doma počítač, ktorý sa prehrieva, je hlučný, zaprášený alebo jednoducho nefunguje tak, ako má, nemusíš problém riešiť sám.

V TOMIKONe sa postaráme o servis, čistenie aj diagnostiku. 🛠️💻

📩 Ozvi sa nám a dohodneme sa na servise.

⭐ TOMIKON – servis počítačov

${hashtags}`;


    return {
        instagram,
        facebook
    };

}


// =========================
// UVOĽNENÝ / SOCIAL
// =========================

function createSocialPost(
    service,
    description
) {

    const hashtags =
        getHashtags(service);


    const instagram = `👀 Tak toto už bolo treba!

${description}

Trochu prachu, trochu servisu a PC môže zase dýchať. 😂💻

Výsledok?
Čistejší počítač, lepšie chladenie a hlavne spokojný zákazník. 🔥

Ak aj tvoj PC potrebuje pomoc, vieš kam napísať. 😎

📩 TOMIKON

${hashtags}`;


    const facebook = `👀 Keď už počítač začína vyzerať ako vysávač, je asi čas na servis. 😂

${description}

Dali sme mu trochu lásky, poriadne ho skontrolovali a pripravili na ďalšiu prevádzku. 💻🔥

Ak aj tvoj PC potrebuje vyčistiť, opraviť alebo diagnostikovať, pokojne sa ozvi.

📩 TOMIKON – nech tvoj počítač zase funguje tak, ako má.

${hashtags}`;


    return {
        instagram,
        facebook
    };

}


// =========================
// NÁZVY SLUŽIEB
// =========================

function getServiceTitle(service) {

    switch(service) {

        case "Čistenie PC":
            return "🧹 Čistenie počítača";

        case "Výmena teplovodivej pasty":
            return "🌡️ Výmena teplovodivej pasty";

        case "Kompletný servis PC":
            return "⚙️ Kompletný servis počítača";

        case "Diagnostika PC":
            return "🔍 Diagnostika počítača";

        default:
            return "💻 Servis počítača";

    }

}


// =========================
// HASHTAGY
// =========================

function getHashtags(service) {

    const common =
        "#TOMIKON #PCservis #ServisPC #Pocitac";

    switch(service) {

        case "Čistenie PC":

            return common +
                " #CisteniePC #GamingPC";

        case "Výmena teplovodivej pasty":

            return common +
                " #TeplovodivaPasta #GamingPC";

        case "Kompletný servis PC":

            return common +
                " #GamingPC #PCmaintenance";

        case "Diagnostika PC":

            return common +
                " #DiagnostikaPC #PCproblem";

        default:

            return common;

    }

}


// =========================
// CAPITALIZE
// =========================

function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}


// =========================
// ZOBRAZENIE 3 VERZIÍ
// =========================

function displayAIResults(posts) {

    const instagramResult =
        document.getElementById(
            "instagramResult"
        );

    const facebookResult =
        document.getElementById(
            "facebookResult"
        );


    // Zatiaľ použijeme najlepšiu
    // profesionálnu verziu
    instagramResult.value =
        posts.professional.instagram;

    facebookResult.value =
        posts.professional.facebook;


    // uložíme všetky verzie
    window.tomikonAIVersions =
        posts;


    addStyleButtons();

}


// =========================
// PREPÍNANIE ŠTÝLOV
// =========================

function addStyleButtons() {

    const results =
        document.getElementById("aiResults");


    if (
        document.getElementById(
            "tomikonStyleButtons"
        )
    ) return;


    const box =
        document.createElement("div");

    box.id =
        "tomikonStyleButtons";

    box.style.cssText = `
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        margin-bottom:20px;
    `;


    box.innerHTML = `

        <button
            type="button"
            class="admin-button tomikon-style-button"
            data-style="professional">

            🟢 Profesionálny

        </button>

        <button
            type="button"
            class="admin-button tomikon-style-button"
            data-style="sales">

            🔴 Predajný

        </button>

        <button
            type="button"
            class="admin-button tomikon-style-button"
            data-style="social">

            🔵 Uvoľnený

        </button>

    `;


    results.insertBefore(
        box,
        results.firstElementChild
    );


    box
        .querySelectorAll(
            ".tomikon-style-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const style =
                        button.dataset.style;

                    const version =
                        window.tomikonAIVersions[
                            style
                        ];


                    document.getElementById(
                        "instagramResult"
                    ).value =
                        version.instagram;


                    document.getElementById(
                        "facebookResult"
                    ).value =
                        version.facebook;

                }
            );

        });

}


// =========================
// KOPÍROVANIE INSTAGRAM
// =========================

const copyInstagram =
    document.getElementById(
        "copyInstagram"
    );

if (copyInstagram) {

    copyInstagram.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "instagramResult"
                ).value;

            await navigator.clipboard
                .writeText(text);

            copyInstagram.textContent =
                "✅ Skopírované!";

            setTimeout(() => {

                copyInstagram.textContent =
                    "📋 Kopírovať Instagram";

            }, 1500);

        }
    );

}


// =========================
// KOPÍROVANIE FACEBOOK
// =========================

const copyFacebook =
    document.getElementById(
        "copyFacebook"
    );

if (copyFacebook) {

    copyFacebook.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "facebookResult"
                ).value;

            await navigator.clipboard
                .writeText(text);

            copyFacebook.textContent =
                "✅ Skopírované!";

            setTimeout(() => {

                copyFacebook.textContent =
                    "📋 Kopírovať Facebook";

            }, 1500);

        }
    );

}

// =========================
// HISTÓRIA TOMIKON AI
// =========================

async function loadAIHistory() {

    const container =
        document.getElementById("aiHistory");

    if (!container) return;

    const { data, error } =
        await supabaseClient
            .from("ai_posts")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        console.error("AI HISTORY ERROR:", error);

        container.innerHTML =
            "<p>❌ Nepodarilo sa načítať históriu.</p>";

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML =
            "<p>📭 Zatiaľ nemáš žiadne uložené príspevky.</p>";

        return;
    }

    container.innerHTML = "";

    data.forEach(post => {

        const card =
            document.createElement("div");

        card.className = "ai-history-card";

        card.innerHTML = `

            <h3>
                🤖 ${escapeHTML(post.service || "TOMIKON AI")}
            </h3>

            <small>
                ${new Date(post.created_at)
                    .toLocaleString("sk-SK")}
            </small>

            <p>
                <strong>Popis:</strong>
                ${escapeHTML(post.description)}
            </p>

            <h4>📸 Instagram</h4>

            <textarea
                readonly
                class="history-text"
            >${post.instagram}</textarea>

            <button
                class="admin-button copy-history-instagram"
                data-text="${encodeURIComponent(post.instagram)}">

                📋 Kopírovať Instagram

            </button>

            <h4>🟦 Facebook</h4>

            <textarea
                readonly
                class="history-text"
            >${post.facebook}</textarea>

            <button
                class="admin-button copy-history-facebook"
                data-text="${encodeURIComponent(post.facebook)}">

                📋 Kopírovať Facebook

            </button>

            <br><br>

            <button
                class="delete-button history-delete"
                data-id="${post.id}">

                🗑️ Zmazať

            </button>
        `;

        container.appendChild(card);

    });

    // KOPÍROVANIE INSTAGRAM

    document
        .querySelectorAll(".copy-history-instagram")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const text =
                    decodeURIComponent(
                        button.dataset.text
                    );

                await navigator.clipboard
                    .writeText(text);

                button.textContent =
                    "✅ Skopírované!";

                setTimeout(() => {

                    button.textContent =
                        "📋 Kopírovať Instagram";

                }, 1500);

            });

        });


    // KOPÍROVANIE FACEBOOK

    document
        .querySelectorAll(".copy-history-facebook")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const text =
                    decodeURIComponent(
                        button.dataset.text
                    );

                await navigator.clipboard
                    .writeText(text);

                button.textContent =
                    "✅ Skopírované!";

                setTimeout(() => {

                    button.textContent =
                        "📋 Kopírovať Facebook";

                }, 1500);

            });

        });


    // MAZANIE

    document
        .querySelectorAll(".history-delete")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const id =
                    button.dataset.id;

                if (!confirm(
                    "Naozaj chceš tento príspevok zmazať?"
                )) {

                    return;

                }

                const { error } =
                    await supabaseClient
                        .from("ai_posts")
                        .delete()
                        .eq("id", id);

                if (error) {

                    alert(
                        "Nepodarilo sa zmazať príspevok."
                    );

                    console.error(error);

                    return;
                }

                loadAIHistory();

            });

        });

}

checkUser();
