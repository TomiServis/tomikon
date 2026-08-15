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
// AI SOCIÁLNE SIETE
// =========================

const generateAIButton =
    document.getElementById("generateAIButton");

if(generateAIButton){

    generateAIButton.addEventListener(
        "click",
        async () => {

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

            if(!description){

                message.textContent =
                    "❌ Napíš krátky popis.";

                return;
            }

            generateAIButton.disabled = true;

            loading.style.display = "block";
            results.style.display = "none";

            message.textContent = "";

            try{

                const {
                    data,
                    error
                } =
                    await supabaseClient.functions.invoke(
                        "generate-social-post-ts",
                        {
                            body:{
                                service,
                                description
                            }
                        }
                    );

                if(error){

                    console.error(
                        "AI FUNCTION ERROR:",
                        error
                    );

                    throw error;
                }

                if(!data){

                    throw new Error(
                        "AI nevrátila žiadne dáta."
                    );
                }

                if(data.error){

                    throw new Error(
                        data.error
                    );
                }

                document.getElementById(
                    "instagramResult"
                ).value =
                    data.instagram || "";

                document.getElementById(
                    "facebookResult"
                ).value =
                    data.facebook || "";

                results.style.display = "block";

                message.textContent =
                    "✅ Príspevky boli vytvorené.";

            }catch(error){

                console.error(
                    "AI ERROR:",
                    error
                );

                message.textContent =
                    "❌ Nepodarilo sa vytvoriť príspevok: " +
                    error.message;

            }finally{

                loading.style.display = "none";

                generateAIButton.disabled = false;

            }

        }
    );

}


// =========================
// KOPÍROVANIE
// =========================

const copyInstagram =
    document.getElementById("copyInstagram");

if(copyInstagram){

    copyInstagram.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "instagramResult"
                ).value;

            await navigator.clipboard.writeText(text);

            copyInstagram.textContent =
                "✅ Skopírované!";

            setTimeout(() => {

                copyInstagram.textContent =
                    "📋 Kopírovať Instagram";

            },1500);

        }
    );

}


const copyFacebook =
    document.getElementById("copyFacebook");

if(copyFacebook){

    copyFacebook.addEventListener(
        "click",
        async () => {

            const text =
                document.getElementById(
                    "facebookResult"
                ).value;

            await navigator.clipboard.writeText(text);

            copyFacebook.textContent =
                "✅ Skopírované!";

            setTimeout(() => {

                copyFacebook.textContent =
                    "📋 Kopírovať Facebook";

            },1500);

        }
    );

}
