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


/* =====================================================
   AUTH SIDEBAR
===================================================== */

async function updateSidebarAuth() {

    const {
        data
    } =
        await bazarClient.auth.getSession();

    const user =
        data.session?.user;


    const loggedIn =
        $("sidebarLoggedIn");

    const loggedOut =
        $("sidebarLoggedOut");

    const email =
        $("sidebarUserEmail");


    if(user){

        if(loggedIn)
            loggedIn.style.display =
                "block";

        if(loggedOut)
            loggedOut.style.display =
                "none";

        if(email)
            email.textContent =
                user.email;

    }else{

        if(loggedIn)
            loggedIn.style.display =
                "none";

        if(loggedOut)
            loggedOut.style.display =
                "block";
    }
}


/* =====================================================
   SIDEBAR LOGIN
===================================================== */

if($("sidebarLoginButton")){

    $("sidebarLoginButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "bazar.html";

            }
        );

}


/* =====================================================
   SIDEBAR REGISTER
===================================================== */

if($("sidebarRegisterButton")){

    $("sidebarRegisterButton")
        .addEventListener(
            "click",
            () => {

                window.location.href =
                    "bazar.html";

            }
        );

}


/* =====================================================
   SIDEBAR LOGOUT
===================================================== */

if($("sidebarLogoutButton")){

    $("sidebarLogoutButton")
        .addEventListener(
            "click",
            async () => {

                const {
                    error
                } =
                    await bazarClient.auth.signOut();


                if(error){

                    console.error(
                        "LOGOUT ERROR:",
                        error
                    );

                    return;
                }


                window.location.href =
                    "bazar.html";

            }
        );

}


/* =====================================================
   LOAD MY LISTINGS
===================================================== */

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


    if(
        error ||
        !data.user
    ){

        window.location.href =
            "bazar.html";

        return;
    }


    const user =
        data.user;


    if(email){

        email.textContent =
            user.email;

    }


    /*
     * Načítame všetky údaje
     * potrebné pre kartu.
     */

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
            created_at,
            views
        `)
        .eq(
            "seller_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(listingsError){

        console.error(
            "MY LISTINGS ERROR:",
            listingsError
        );


        container.innerHTML = `

            <div id="myMessage">

                ❌ Nepodarilo sa načítať
                tvoje inzeráty.

            </div>

        `;

        return;
    }


    if(
        !listings ||
        listings.length === 0
    ){

        container.innerHTML = `

            <div id="myMessage">

                📦 Zatiaľ nemáš žiadne inzeráty.

                <br><br>

                <a
                    href="bazar.html"
                    class="my-action view"
                    style="
                        display:inline-flex;
                        width:auto;
                        padding:12px 18px;
                    "
                >
                    ➕ Pridať prvý inzerát
                </a>

            </div>

        `;

        return;
    }


    /*
     * Načítanie obrázkov
     */

    const listingIds =
        listings.map(
            listing =>
                listing.id
        );


    const {
        data: images,
        error: imagesError
    } =
        await bazarClient
        .from("bazar_images")
        .select(`
            id,
            listing_id,
            image_url,
            sort_order
        `)
        .in(
            "listing_id",
            listingIds
        )
        .order(
            "sort_order",
            {
                ascending:true
            }
        );


    if(imagesError){

        console.error(
            "MY IMAGES ERROR:",
            imagesError
        );

    }


    const imagesByListing = {};


    (images || [])
        .forEach(
            image => {

                if(
                    !imagesByListing[
                        image.listing_id
                    ]
                ){

                    imagesByListing[
                        image.listing_id
                    ] = [];

                }


                imagesByListing[
                    image.listing_id
                ].push(image);

            }
        );


    container.innerHTML = "";


    listings.forEach(
        listing => {

            const card =
                document.createElement(
                    "article"
                );


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
                    listing.price || 0
                ).toLocaleString(
                    "sk-SK",
                    {
                        minimumFractionDigits:2,
                        maximumFractionDigits:2
                    }
                );


            const date =
                new Date(
                    listing.created_at
                ).toLocaleDateString(
                    "sk-SK"
                );


            const views =
                Number(
                    listing.views || 0
                );


            const listingImages =
                imagesByListing[
                    listing.id
                ] || [];


            const mainImage =
                listingImages.length > 0
                    ? listingImages[0].image_url
                    : null;


            card.innerHTML = `

                <!-- FOTO -->

                <div class="my-card-image">

                    ${
                        mainImage

                        ? `

                            <img
                                src="${escapeHTML(
                                    mainImage
                                )}"
                                alt="${escapeHTML(
                                    listing.title
                                )}"
                            >

                          `

                        : `

                            <div class="my-no-image">
                                📷
                            </div>

                          `
                    }

                </div>


                <!-- OBSAH -->

                <div class="my-card-content">

                    ${status}


                    <div class="my-card-meta">

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


                    <div class="my-card-info">

                        👁️
                        <strong>
                            ${views}
                        </strong>
                        zobrazení

                        <br>

                        📅
                        ${date}

                    </div>


                    <div class="my-actions">


                        <a
                            class="my-action view"
                            href="bazar-detail.html?id=${listing.id}"
                        >

                            👁️ Zobraziť inzerát

                        </a>


                        <button
                            class="my-action edit"
                            data-id="${listing.id}"
                            type="button"
                        >

                            ✏️ Upraviť

                        </button>


                        <button
                            class="my-action delete"
                            data-id="${listing.id}"
                            type="button"
                        >

                            🗑️ Zmazať

                        </button>


                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    /* =================================================
       EDIT BUTTONS
    ================================================= */

    document
        .querySelectorAll(
            ".my-action.edit"
        )
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


                        if(listing){

                            openEditModal(
                                listing
                            );

                        }

                    }
                );

            }
        );


    /* =================================================
       DELETE BUTTONS
    ================================================= */

    document
        .querySelectorAll(
            ".my-action.delete"
        )
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


                        if(!confirmed)
                            return;


                        await deleteListing(
                            id
                        );

                    }
                );

            }
        );

}


/* =====================================================
   OPEN EDIT MODAL
===================================================== */

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


/* =====================================================
   CLOSE EDIT MODAL
===================================================== */

function closeEditModal() {

    $("editModal")
        .classList
        .remove("active");

}


if($("closeEditModal")){

    $("closeEditModal")
        .addEventListener(
            "click",
            closeEditModal
        );

}


if($("cancelEdit")){

    $("cancelEdit")
        .addEventListener(
            "click",
            closeEditModal
        );

}


/* =====================================================
   CLICK OUTSIDE MODAL
===================================================== */

if($("editModal")){

    $("editModal")
        .addEventListener(
            "click",
            event => {

                if(
                    event.target ===
                    $("editModal")
                ){

                    closeEditModal();

                }

            }
        );

}


/* =====================================================
   ESC
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if(
            event.key === "Escape"
        ){

            closeEditModal();

        }

    }
);


/* =====================================================
   SAVE EDIT
===================================================== */

if($("editForm")){

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
                    $("editTitle")
                    .value
                    .trim();


                const category =
                    $("editCategory")
                    .value;


                const price =
                    Number(
                        $("editPrice").value
                    );


                const city =
                    $("editCity")
                    .value
                    .trim();


                const contact =
                    $("editContact")
                    .value
                    .trim();


                const description =
                    $("editDescription")
                    .value
                    .trim();


                if(
                    !title ||
                    !category ||
                    !Number.isFinite(price) ||
                    !city ||
                    !contact ||
                    !description
                ){

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

                        /*
                         * Po úprave musí admin
                         * inzerát znovu schváliť.
                         */

                        approved:false

                    })
                    .eq(
                        "id",
                        id
                    );


                if(error){

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

}


/* =====================================================
   DELETE LISTING
===================================================== */

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


    if(error){

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


/* =====================================================
   AUTH STATE
===================================================== */

bazarClient.auth.onAuthStateChange(
    async (
        event,
        session
    ) => {

        await updateSidebarAuth();


        if(
            event === "SIGNED_OUT"
        ){

            window.location.href =
                "bazar.html";

        }

    }
);


/* =====================================================
   START
===================================================== */

(async function(){

    await updateSidebarAuth();

    await loadMyListings();

})();
