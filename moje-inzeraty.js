const SUPABASE_URL =
    "https://sjhlzllylobreeehziae.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_";


const bazarClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


const $ = id =>
    document.getElementById(id);


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


async function loadMyListings() {

    const container =
        $("myListings");

    const email =
        $("myUserEmail");


    // =========================
    // PRIHLÁSENIE
    // =========================

    const {
        data,
        error
    } =
        await bazarClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        window.location.href =
            "bazar.html";

        return;

    }


    const user =
        data.user;


    email.textContent =
        user.email;


    // =========================
    // MOJE INZERÁTY
    // =========================

    const {
        data: listings,
        error: listingsError
    } =
        await bazarClient
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
            created_at
        `)
        .eq(
            "seller_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (listingsError) {

        console.error(
            "MY LISTINGS ERROR:",
            listingsError
        );

        container.innerHTML =
            `
            <div id="myMessage">
                ❌ Nepodarilo sa načítať tvoje inzeráty.
            </div>
            `;

        return;

    }


    // =========================
    // ŽIADNE INZERÁTY
    // =========================

    if (
        !listings ||
        listings.length === 0
    ) {

        container.innerHTML =
            `
            <div id="myMessage">
                📦 Zatiaľ nemáš žiadne inzeráty.
                <br><br>

                <a
                    href="bazar.html"
                    class="my-open"
                >
                    ➕ Pridať prvý inzerát
                </a>

            </div>
            `;

        return;

    }


    // =========================
    // VYKRESLENIE
    // =========================

    container.innerHTML = "";


    listings.forEach(
        listing => {

            const card =
                document.createElement("article");

            card.className =
                "my-card";


            const status =
                listing.approved
                    ? `
                        <span
                            class="my-status approved"
                        >
                            ✅ Schválený
                        </span>
                      `
                    : `
                        <span
                            class="my-status pending"
                        >
                            ⏳ Čaká na schválenie
                        </span>
                      `;


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
                new Date(
                    listing.created_at
                ).toLocaleDateString(
                    "sk-SK"
                );


            card.innerHTML =
                `

                ${status}


                <div class="my-info">

                    ${escapeHTML(
                        listing.category
                    )}

                    · 📍

                    ${escapeHTML(
                        listing.city
                    )}

                </div>


                <h2>
                    ${escapeHTML(
                        listing.title
                    )}
                </h2>


                <div class="my-price">

                    ${price} €

                </div>


                <div class="my-info">

                    📞
                    ${escapeHTML(
                        listing.contact
                    )}

                    <br>

                    📅
                    ${date}

                </div>


                <a
                    class="my-open"
                    href="bazar-detail.html?id=${listing.id}"
                >

                    👁️ Zobraziť inzerát →

                </a>

                `;


            container.appendChild(
                card
            );

        }
    );

}


// =========================
// SPÄŤ NA BAZÁR
// =========================

$("backBazarButton")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "bazar.html";

        }
    );


// =========================
// START
// =========================

loadMyListings();
