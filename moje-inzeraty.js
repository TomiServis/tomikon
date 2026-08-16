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


/* =========================
   LOAD MY LISTINGS
========================= */

async function loadMyListings() {

    const container =
        $("myListings");

    const email =
        $("myUserEmail");


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

        container.innerHTML = `
            <div id="myMessage">
                ❌ Nepodarilo sa načítať tvoje inzeráty.
            </div>
        `;

        return;
    }


    if (
        !listings ||
        listings.length === 0
    ) {

        container.innerHTML = `
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
                        <span class="my-status approved">
                            ✅ Schválený
                        </span>
                      `
                    : `
                        <span class="my-status pending">
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


            card.innerHTML = `

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


                <div class="my-actions">

                    <a
                        class="my-action view"
                        href="bazar-detail.html?id=${listing.id}"
                    >
                        👁️ Zobraziť
                    </a>

                    <button
                        class="my-action edit"
                        data-id="${listing.id}"
                    >
                        ✏️ Upraviť
                    </button>

                    <button
                        class="my-action delete"
                        data-id="${listing.id}"
                    >
                        🗑️ Zmazať
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    /* =========================
       EDIT BUTTONS
    ========================= */

    document
        .querySelectorAll(".my-action.edit")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        const listing =
                            listings.find(
                                item =>
                                    item.id === id
                            );

                        if (
                            listing
                        ) {

                            openEditModal(
                                listing
                            );

                        }

                    }
                );

            }
        );


    /* =========================
       DELETE BUTTONS
    ========================= */

    document
        .querySelectorAll(".my-action.delete")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        const confirmed =
                            confirm(
                                "Naozaj chceš tento inzerát zmazať?"
                            );


                        if (
                            !confirmed
                        ) {

                            return;

                        }


                        await deleteListing(
                            id
                        );

                    }
                );

            }
        );

}


/* =========================
   OPEN EDIT MODAL
========================= */

function openEditModal(
    listing
) {

    $("editId").value =
        listing.id;

    $("editTitle").value =
        listing.title ?? "";

    $("editCategory").value =
        listing.category ?? "";

    $("editPrice").value =
        listing.price ?? "";

    $("editCity").value =
        listing.city ?? "";

    $("editContact").value =
        listing.contact ?? "";

    $("editDescription").value =
        listing.description ?? "";

    $("editMessage").textContent =
        "";

    $("editModal")
        .classList
        .add("active");

}


/* =========================
   CLOSE EDIT MODAL
========================= */

function closeEditModal() {

    $("editModal")
        .classList
        .remove("active");

}


$("closeEditModal")
    .addEventListener(
        "click",
        closeEditModal
    );


$("cancelEdit")
    .addEventListener(
        "click",
        closeEditModal
    );


/* KLIKNUTIE MIMO MODALU */

$("editModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("editModal")
            ) {

                closeEditModal();

            }

        }
    );


/* ESC */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeEditModal();

        }

    }
);


/* =========================
   SAVE EDIT
========================= */

$("editForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const message =
                $("editMessage");


            const id =
                Number(
                    $("editId").value
                );


            const title =
                $("editTitle").value.trim();


            const category =
                $("editCategory").value;


            const price =
                Number(
                    $("editPrice").value
                );


            const city =
                $("editCity").value.trim();


            const contact =
                $("editContact").value.trim();


            const description =
                $("editDescription")
                    .value
                    .trim();


            if (
                !title ||
                !category ||
                !Number.isFinite(price) ||
                !city ||
                !contact ||
                !description
            ) {

                message.textContent =
                    "❌ Vyplň všetky údaje.";

                message.style.color =
                    "#ff5555";

                return;

            }


            message.textContent =
                "⏳ Ukladám zmeny...";

            message.style.color =
                "#aaa";


            /*
             * Pri úprave nastavíme approved = false.
             *
             * Admin teda musí zmenu znovu schváliť.
             */

            const {
                error
            } =
                await bazarClient
                .from("bazar_listings")
                .update({

                    title,
                    category,
                    price,
                    city,
                    contact,
                    description,

                    approved: false

                })
                .eq(
                    "id",
                    id
                );


            if (
                error
            ) {

                console.error(
                    "UPDATE ERROR:",
                    error
                );

                message.textContent =
                    "❌ Nepodarilo sa uložiť zmeny.";

                message.style.color =
                    "#ff5555";

                return;

            }


            message.textContent =
                "✅ Zmeny boli uložené.";

            message.style.color =
                "#00d084";


            setTimeout(
                () => {

                    closeEditModal();

                    loadMyListings();

                },
                800
            );

        }
    );


/* =========================
   DELETE LISTING
========================= */

async function deleteListing(
    id
) {

    const {
        error
    } =
        await bazarClient
        .from("bazar_listings")
        .delete()
        .eq(
            "id",
            id
        );


    if (
        error
    ) {

        console.error(
            "DELETE ERROR:",
            error
        );

        alert(
            "❌ Inzerát sa nepodarilo zmazať."
        );

        return;

    }


    alert(
        "✅ Inzerát bol zmazaný."
    );


    loadMyListings();

}


/* =========================
   BACK TO BAZAR
========================= */

$("backBazarButton")
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "bazar.html";

        }
    );


/* =========================
   START
========================= */

loadMyListings();
