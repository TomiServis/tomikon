const SUPABASE_URL = https://sjhlzllylobreeehziae.supabase.co;
const SUPABASE_KEY = sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_;

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================
// PRIHLÁSENIE
// =========================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

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

    if(loginError){

        error.textContent =
            "Nesprávny e-mail alebo heslo.";

        return;
    }

    showAdmin();

});


// =========================
// KONTROLA PRIHLÁSENIA
// =========================

async function checkUser(){

    const { data } =
        await supabaseClient.auth.getSession();

    if(data.session){

        showAdmin();

    }else{

        showLogin();

    }

}


function showAdmin(){

    document
        .getElementById("loginSection")
        .classList.add("hidden");

    document
        .getElementById("adminSection")
        .classList.remove("hidden");

    loadReviews();

}


function showLogin(){

    document
        .getElementById("loginSection")
        .classList.remove("hidden");

    document
        .getElementById("adminSection")
        .classList.add("hidden");

}


// =========================
// NAČÍTANIE RECENZIÍ
// =========================

async function loadReviews(){

    const reviewsContainer =
        document.getElementById("reviews");

    const { data, error } =
        await supabaseClient
        .from("reviews")
        .select("*")
        .eq("approved", false)
        .order("created_at", {
            ascending:false
        });

    if(error){

        reviewsContainer.innerHTML =
            "<p>Nepodarilo sa načítať recenzie.</p>";

        console.error(error);

        return;
    }

    if(!data || data.length === 0){

        reviewsContainer.innerHTML =
            "<p>🎉 Žiadne recenzie čakajúce na schválenie.</p>";

        return;
    }

    reviewsContainer.innerHTML = "";

    data.forEach(review => {

        const card =
            document.createElement("div");

        card.className = "review-card";

        const stars =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);

        card.innerHTML = `

            <h3>${escapeHTML(review.name)}</h3>

            <div class="review-stars">
                ${stars}
            </div>

            <p>
                ${escapeHTML(review.text)}
            </p>

            <small>
                ${new Date(review.created_at).toLocaleString("sk-SK")}
            </small>

            <div class="review-actions">

                <button
                    class="approve-button"
                    onclick="approveReview(${review.id})">

                    ✅ Schváliť

                </button>

                <button
                    class="delete-button"
                    onclick="deleteReview(${review.id})">

                    🗑️ Zmazať

                </button>

            </div>
        `;

        reviewsContainer.appendChild(card);

    });

}


// =========================
// SCHVÁLENIE
// =========================

async function approveReview(id){

    const { error } =
        await supabaseClient
        .from("reviews")
        .update({
            approved:true
        })
        .eq("id", id);

    if(error){

        alert("Nepodarilo sa schváliť recenziu.");

        console.error(error);

        return;
    }

    loadReviews();

}


// =========================
// ZMAZANIE
// =========================

async function deleteReview(id){

    if(!confirm(
        "Naozaj chceš túto recenziu zmazať?"
    )){

        return;

    }

    const { error } =
        await supabaseClient
        .from("reviews")
        .delete()
        .eq("id", id);

    if(error){

        alert("Nepodarilo sa zmazať recenziu.");

        console.error(error);

        return;
    }

    loadReviews();

}


// =========================
// ODHLÁSENIE
// =========================

document
.getElementById("logoutButton")
.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    showLogin();

});


// =========================
// OCHRANA HTML
// =========================

function escapeHTML(text){

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


checkUser();
