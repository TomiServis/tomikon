// =========================================================
// TOMIKON BAZÁR – ADMIN
// =========================================================

const SUPABASE_URL =
    "https://sjhlzllylobreeehziae.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_";


const adminClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================================================
// POMOCNÉ FUNKCIE
// =========================================================

const $ = id =>
    document.getElementById(id);


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =========================================================
// KONTROLA ADMINA
// =========================================================

async function checkAdmin() {

    const {
        data,
        error
    } =
        await adminClient.auth.getUser();


    if (
        error ||
        !data ||
        !data.user
    ) {

        window.location.href =
            "bazar.html";

        return null;

    }


    const user =
        data.user;


    // Zobrazíme e-mail
    if ($("adminEmail")) {

        $("adminEmail").textContent =
            user.email || "";

    }


    // -----------------------------------------
    // OVERENIE ADMIN ROLE
    // -----------------------------------------

    const {
        data: isAdmin,
        error: adminError
    } =
        await adminClient.rpc(
            "is_admin"
        );


    if (
        adminError ||
        !isAdmin
    ) {

        alert(
            "⛔ Nemáš oprávnenie na vstup do administrácie."
        );


        window.location.href =
            "bazar.html";


        return null;

    }


    return user;

}


// =========================================================
// NAČÍTANIE INZERÁTOV
// =========================================================

let allListings = [];


async function loadListings() {

    const container =
        $("adminListings");


    container.innerHTML =
        `
        <div class="admin-loading">
            ⏳ Načítavam inzeráty...
        </div>
        `;


    const {
        data,
        error
    } =
        await adminClient
        .from("bazar_listings")
        .select(`
            id,
            title,
            category,
            price,
            city,
            contact,
            description,
            approved,
            created_at,
            seller_id
        `)
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "ADMIN LISTINGS ERROR:",
            error
        );


        container.innerHTML =
            `
            <div class="admin-loading">

                ❌ Nepodarilo sa načítať inzeráty.

                <br><br>

                <small>
                    ${escapeHTML(error.message)}
                </small>

            </div>
            `;


        return;

    }


    allListings =
        data || [];


    updateStatistics();


    renderListings();

}


// =========================================================
// ŠTATISTIKY
// =========================================================

function updateStatistics() {

    const total =
        allListings.length;


    const pending =
        allListings.filter(
            listing =>
                !listing.approved
        ).length;


    const approved =
        allListings.filter(
            listing =>
                listing.approved
        ).length;


    $("totalListings").textContent =
        total;


    $("pendingListings").textContent =
        pending;


    $("approvedListings").textContent =
        approved;

}


// =========================================================
// FILTROVANIE
// =========================================================

function getFilteredListings() {

    const search =
        (
            $("adminSearch").value ||
            ""
        )
        .trim()
        .toLowerCase();


    const status =
        $("adminStatusFilter").value;


    const category =
        $("adminCategoryFilter").value;


    return allListings.filter(
        listing => {


            // -----------------------------
            // VYHĽADÁVANIE
            // -----------------------------

            const searchText =
                `
                ${listing.title || ""}
                ${listing.city || ""}
                ${listing.contact || ""}
                ${listing.description || ""}
                `
                .toLowerCase();


            if (
                search &&
                !searchText.includes(search)
            ) {

                return false;

            }


            // -----------------------------
            // STAV
            // -----------------------------

            if (
                status === "approved" &&
                !listing.approved
            ) {

                return false;

            }


            if (
                status === "pending" &&
                listing.approved
            ) {

                return false;

            }


            // -----------------------------
            // KATEGÓRIA
            // -----------------------------

            if (
                category &&
                listing.category !== category
            ) {

                return false;

            }


            return true;

        }
    );

}


// =========================================================
// VYKRESLENIE
// =========================================================

function renderListings() {

    const container =
        $("adminListings");


    const listings =
        getFilteredListings();


    if (
        listings.length === 0
    ) {

        container.innerHTML =
            `
            <div class="admin-loading">

                📦 Žiadne inzeráty
                podľa zvoleného filtra.

            </div>
            `;

        return;

    }


    container.innerHTML = "";


    listings.forEach(
        listing => {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "admin-listing";


            const price =
                Number(
                    listing.price
                ).toLocaleString(
                    "sk-SK",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );


            const date =
                listing.created_at
                    ? new Date(
                        listing.created_at
                    ).toLocaleDateString(
                        "sk-SK"
                    )
                    : "—";


            const status =
                listing.approved
                    ?
                    `
                    <span
                        class="admin-status approved"
                    >
                        ✅ Schválený
                    </span>
                    `
                    :
                    `
                    <span
                        class="admin-status pending"
                    >
                        ⏳ Čaká na schválenie
                    </span>
                    `;


            card.innerHTML =
                `

                <div class="admin-listing-main">

                    <div class="admin-listing-top">

                        ${status}

                        <span class="admin-listing-date">
                            📅 ${date}
                        </span>

                    </div>


                    <h3>
                        ${escapeHTML(
                            listing.title
                        )}
                    </h3>


                    <div class="admin-listing-meta">

                        <span>
                            🗂️
                            ${escapeHTML(
                                listing.category
                            )}
                        </span>

                        <span>
                            📍
                            ${escapeHTML(
                                listing.city
                            )}
                        </span>

                        <strong>
                            ${price} €
                        </strong>

                    </div>


                    <div class="admin-listing-contact">

                        📞
                        ${escapeHTML(
                            listing.contact
                        )}

                    </div>

                </div>


                <div class="admin-listing-actions">

                    <a
                        href="bazar-detail.html?id=${encodeURIComponent(
                            listing.id
                        )}"
                        class="admin-button"
                    >
                        👁️ Detail
                    </a>

                </div>

                `;


            container.appendChild(
                card
            );

        }
    );

}


// =========================================================
// FILTRE – EVENTY
// =========================================================

$("adminSearch")
    .addEventListener(
        "input",
        renderListings
    );


$("adminStatusFilter")
    .addEventListener(
        "change",
        renderListings
    );


$("adminCategoryFilter")
    .addEventListener(
        "change",
        renderListings
    );


// =========================================================
// SPÄŤ NA BAZÁR
// =========================================================

$("backBazarButton")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "bazar.html";

        }
    );


// =========================================================
// ODHLÁSENIE
// =========================================================

$("adminLogoutButton")
    .addEventListener(
        "click",
        async () => {


            await adminClient.auth.signOut();


            window.location.href =
                "bazar.html";

        }
    );


// =========================================================
// START
// =========================================================

async function initAdmin() {

    const user =
        await checkAdmin();


    if (!user) {

        return;

    }


    await loadListings();

}


initAdmin();
