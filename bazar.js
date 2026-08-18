const SUPABASE_URL =
    "https://sjhlzllylobreeehziae.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_";


const bazarClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =========================
// POMOCNÉ FUNKCIE
// =========================

const $ = (id) =>
    document.getElementById(id);


function escapeHTML(value){

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// =========================
// NÁHĽAD FOTIEK
// =========================

const bazarImagesInput = $("bazarImages");
const imagePreview = $("imagePreview");

// Tu držíme skutočný zoznam vybraných fotiek
let selectedImageFiles = [];


// =========================
// VYKRESLENIE NÁHĽADOV
// =========================

function renderImagePreview() {

    if (!imagePreview)
        return;

    imagePreview.innerHTML = "";

    selectedImageFiles.forEach((file, index) => {

        const wrapper = document.createElement("div");

        wrapper.style.position = "relative";
        wrapper.style.width = "120px";
        wrapper.style.height = "90px";


        const img = document.createElement("img");

        img.src = URL.createObjectURL(file);

        img.alt = file.name;

        img.style.width = "120px";
        img.style.height = "90px";
        img.style.objectFit = "cover";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid #008cff";
        img.style.display = "block";


        // =========================
        // X TLAČIDLO
        // =========================

        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.textContent = "×";

        removeButton.title = "Odstrániť fotku";

        removeButton.style.position = "absolute";
        removeButton.style.top = "4px";
        removeButton.style.right = "4px";

        removeButton.style.width = "25px";
        removeButton.style.height = "25px";

        removeButton.style.padding = "0";

        removeButton.style.border = "1px solid rgba(255,255,255,.5)";
        removeButton.style.borderRadius = "50%";

        removeButton.style.background = "#e0003c";
        removeButton.style.color = "#fff";

        removeButton.style.fontSize = "18px";
        removeButton.style.fontWeight = "bold";

        removeButton.style.lineHeight = "22px";

        removeButton.style.cursor = "pointer";

        removeButton.style.zIndex = "5";

        removeButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                // odstráni fotku zo zoznamu
                selectedImageFiles.splice(index, 1);

                // prekreslí náhľady
                renderImagePreview();

                // synchronizuje input
                syncImageInput();

            }
        );


        wrapper.appendChild(img);
        wrapper.appendChild(removeButton);

        imagePreview.appendChild(wrapper);

    });


    // Počet fotiek
    const countText =
        document.getElementById("imageCount");

    if(countText){

        countText.textContent =
            `Počet súborov: ${selectedImageFiles.length}`;

    }

}


// =========================
// SYNCHRONIZÁCIA FILE INPUTU
// =========================

function syncImageInput() {

    if(!bazarImagesInput)
        return;


    const dataTransfer =
        new DataTransfer();


    selectedImageFiles.forEach(file => {

        dataTransfer.items.add(file);

    });


    bazarImagesInput.files =
        dataTransfer.files;

}


// =========================
// VÝBER FOTIEK
// =========================

if(bazarImagesInput){

    bazarImagesInput.addEventListener(
        "change",
        function(){

            const newFiles =
                Array.from(
                    bazarImagesInput.files
                );


            for(const file of newFiles){

                // -------------------------
                // KONTROLA TYPU
                // -------------------------

                if(!file.type.startsWith("image/")){

                    alert(
                        `"${file.name}" nie je obrázok.`
                    );

                    continue;

                }


                // -------------------------
                // MAX 10 MB
                // -------------------------

                if(
                    file.size >
                    10 * 1024 * 1024
                ){

                    alert(
                        `Fotka "${file.name}" je väčšia ako 10 MB.`
                    );

                    continue;

                }


                // -------------------------
                // MAX 8 FOTIEK
                // -------------------------

                if(
                    selectedImageFiles.length >= 8
                ){

                    alert(
                        "Môžeš mať maximálne 8 fotiek."
                    );

                    break;

                }


                // -------------------------
                // DUPLIKÁT
                // -------------------------

                const alreadyExists =
                    selectedImageFiles.some(
                        existingFile =>
                            existingFile.name === file.name &&
                            existingFile.size === file.size &&
                            existingFile.lastModified === file.lastModified
                    );


                if(alreadyExists)
                    continue;


                // -------------------------
                // PRIDANIE
                // -------------------------

                selectedImageFiles.push(file);

            }


            // input vyčistíme, aby bolo možné
            // znova vybrať rovnakú fotku
            bazarImagesInput.value = "";


            renderImagePreview();

            syncImageInput();

        }
    );

}


// =========================
// NAČÍTANIE INZERÁTOV
// =========================

async function loadBazar() {

    const listings = $("bazarListings");

    if (!listings) return;

    const search = ($("search")?.value || "").trim();
    const category = $("filterCategory")?.value || "";
    const minPriceValue = $("minPrice")?.value || "";
    const maxPriceValue = $("maxPrice")?.value || "";

    listings.innerHTML = "<p>⏳ Načítavam...</p>";

    let query = bazarClient
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
        .eq("approved", true)
        .order("created_at", { ascending: false });

    if (category) {
        query = query.eq("category", category);
    }

    if (minPriceValue !== "") {
        const minPrice = Number(minPriceValue);
        if (!Number.isNaN(minPrice)) {
            query = query.gte("price", minPrice);
        }
    }

    if (maxPriceValue !== "") {
        const maxPrice = Number(maxPriceValue);
        if (!Number.isNaN(maxPrice)) {
            query = query.lte("price", maxPrice);
        }
    }

    if (search) {
        const safeSearch = search.replace(/,/g, " ");
        query = query.or(
            `title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%,city.ilike.%${safeSearch}%`
        );
    }

    const { data, error } = await query;

    // =========================
    // CHYBA
    // =========================

    if(error){

        console.error(
            "BAZAR ERROR:",
            error
        );


        listings.innerHTML =
            `
            <p>
                ❌ Nepodarilo sa načítať inzeráty.
            </p>
            `;


        return;

    }


    // =========================
    // ŽIADNE INZERÁTY
    // =========================

    if(!data || data.length === 0){

        listings.innerHTML =
            `
            <p>
                🛒 Zatiaľ tu nie sú žiadne
                schválené inzeráty.
            </p>
            `;

        return;

    }


    // =========================
    // NAČÍTANIE FOTIEK
    // =========================

    const listingIds =
        data.map(
            listing => listing.id
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
            "BAZAR IMAGES ERROR:",
            imagesError
        );

    }


    const imagesByListing = {};


    (images || []).forEach(image => {

        if(!imagesByListing[image.listing_id]){

            imagesByListing[image.listing_id] =
                [];

        }


        imagesByListing[image.listing_id]
            .push(image);

    });


    // =========================
    // VYKRESLENIE
    // =========================

    listings.innerHTML = "";


    data.forEach(listing => {

        const card =
            document.createElement("article");


        card.className =
            "bazar-card";
        card.style.cursor = "pointer";

card.addEventListener("click", function(){

    window.location.href =
        `bazar-detail.html?id=${listing.id}`;

});


        const price =
            Number(
                listing.price
            ).toLocaleString(
                "sk-SK",
                {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                }
            );


        const listingImages =
            imagesByListing[listing.id] ||
            [];


       // =========================
// HLAVNÁ FOTKA
// =========================

let imagesHTML = "";

if (listingImages.length > 0) {

    const mainImage = listingImages[0];

    imagesHTML = `
        <div class="bazar-main-image">
            <img
                src="${escapeHTML(mainImage.image_url)}"
                alt="${escapeHTML(listing.title)}"
            >
        </div>
    `;

} else {

    imagesHTML = `
        <div class="bazar-main-image bazar-no-image">
            🖥️
        </div>
    `;

}


        card.innerHTML =
            `

            ${imagesHTML}


            <div class="bazar-meta">

                ${escapeHTML(
                    listing.category
                )}

                ·

                📍 ${escapeHTML(
                    listing.city
                )}

            </div>


            <h3>

                ${escapeHTML(
                    listing.title
                )}

            </h3>


            <div class="bazar-price">

                ${price} €

            </div>


            <p class="bazar-description-preview">

    ${escapeHTML(
        listing.description
    )}

</p>


           <div
    class="bazar-meta"
    style="margin-top:10px;"
>

    📅

    ${new Date(
        listing.created_at
    ).toLocaleDateString(
        "sk-SK"
    )}

</div>

<div
    class="bazar-meta"
    style="margin-top:8px;"
>

    👁️

    ${Number(listing.views || 0)} zobrazení

</div>

            `;


        listings.appendChild(
            card
        );

    });

}


// =========================
// PRIDANIE INZERÁTU
// =========================

$("bazarForm")
.addEventListener(
    "submit",
    async function(event){

        event.preventDefault();


        const message =
            $("bazarMessage");


        const submitButton =
            event.submitter;


        if(submitButton){

            submitButton.disabled =
                true;

        }


        try{

            message.textContent =
                "📤 Odosielam inzerát...";


            // =========================
            // KONTROLA PRIHLÁSENIA
            // =========================

            const {
                data,
                error: sessionError
            } =
                await bazarClient.auth.getSession();


            if(sessionError){

                console.error(
                    sessionError
                );


                message.textContent =
                    "❌ Nepodarilo sa overiť prihlásenie.";

                return;

            }


            const user =
                data.session?.user;


            if(!user){

                message.textContent =
                    "❌ Najprv sa musíš prihlásiť.";

                return;

            }


            // =========================
            // ÚDAJE
            // =========================

            const title =
                $("title")
                .value
                .trim();


            const category =
                $("category")
                .value;


            const price =
                Number(
                    $("price")
                    .value
                );


            const city =
                $("city")
                .value
                .trim();


            const contact =
                $("contact")
                .value
                .trim();


            const description =
                $("description")
                .value
                .trim();


            const selectedFiles =
                bazarImagesInput
                    ? Array.from(
                        bazarImagesInput.files
                    )
                    : [];


            // =========================
            // KONTROLA
            // =========================

            if(
                !title ||
                !category ||
                !city ||
                !contact ||
                !description
            ){

                message.textContent =
                    "❌ Vyplň všetky údaje.";

                return;

            }


            if(
                Number.isNaN(price) ||
                price < 0
            ){

                message.textContent =
                    "❌ Zadaj platnú cenu.";

                return;

            }


            if(selectedFiles.length > 8){

                message.textContent =
                    "❌ Môžeš vybrať maximálne 8 fotiek.";

                return;

            }


            for(const file of selectedFiles){

                if(
                    !file.type.startsWith(
                        "image/"
                    )
                ){

                    message.textContent =
                        "❌ Všetky súbory musia byť obrázky.";

                    return;

                }


                if(
                    file.size >
                    10 * 1024 * 1024
                ){

                    message.textContent =
                        `❌ Fotka "${file.name}" je väčšia ako 10 MB.`;

                    return;

                }

            }


            // =========================
            // VYTVORENIE INZERÁTU
            // =========================

            message.textContent =
                "📝 Vytváram inzerát...";


            const {
                data: listingData,
                error: listingError
            } =
                await bazarClient
                .from("bazar_listings")
                .insert({

                    seller_id:
                        user.id,

                    title:
                        title,

                    category:
                        category,

                    price:
                        price,

                    city:
                        city,

                    contact:
                        contact,

                    description:
                        description,

                    approved:
                        false

                })
                .select("id")
                .single();


            if(listingError){

                console.error(
                    "BAZAR INSERT ERROR:",
                    listingError
                );


                message.textContent =
                    "❌ " +
                    listingError.message;

                return;

            }


            const listingId =
                listingData.id;


            // =========================
            // UPLOAD FOTIEK
            // =========================

            if(selectedFiles.length > 0){

                message.textContent =
                    "📸 Nahrávam fotky...";


                for(
                    let index = 0;
                    index < selectedFiles.length;
                    index++
                ){

                    const file =
                        selectedFiles[index];


                    const safeName =
                        file.name
                        .replace(
                            /[^a-zA-Z0-9._-]/g,
                            "_"
                        );


                    const filePath =
                        `${user.id}/${listingId}/${crypto.randomUUID()}-${safeName}`;


                    const {
                        error: uploadError
                    } =
                        await bazarClient
                        .storage
                        .from("bazar-images")
                        .upload(
                            filePath,
                            file,
                            {
                                contentType:
                                    file.type,

                                upsert:
                                    false
                            }
                        );


                    if(uploadError){

                        console.error(
                            "IMAGE UPLOAD ERROR:",
                            uploadError
                        );


                        message.textContent =
                            "❌ Nepodarilo sa nahrať jednu z fotiek.";

                        return;

                    }


                    // =========================
                    // VEREJNÁ URL
                    // =========================

                    const {
                        data: publicUrlData
                    } =
                        bazarClient
                        .storage
                        .from("bazar-images")
                        .getPublicUrl(
                            filePath
                        );


                    const imageUrl =
                        publicUrlData.publicUrl;


                    // =========================
                    // ULOŽENIE URL
                    // =========================

                    const {
                        error: imageDbError
                    } =
                        await bazarClient
                        .from("bazar_images")
                        .insert({

                            listing_id:
                                listingId,

                            image_url:
                                imageUrl,

                            sort_order:
                                index

                        });


                    if(imageDbError){

                        console.error(
                            "IMAGE DATABASE ERROR:",
                            imageDbError
                        );


                        message.textContent =
                            "❌ Fotka bola nahraná, ale nepodarilo sa ju uložiť.";

                        return;

                    }

                }

            }


            // =========================
            // ÚSPECH
            // =========================

            $("bazarForm")
                .reset();

            selectedImageFiles = [];
            syncImageInput();

            if(imagePreview){

                imagePreview.innerHTML =
                    "";

            }


            message.textContent =
                "✅ Inzerát bol odoslaný. " +
                "Čaká na schválenie administrátorom.";


            await loadBazar();

        }
        catch(error){

            console.error(
                "BAZAR UNEXPECTED ERROR:",
                error
            );


            message.textContent =
                "❌ Nastala neočakávaná chyba.";

        }
        finally{

            if(submitButton){

                submitButton.disabled =
                    false;

            }

        }

    }
);


// =========================
// FILTRE
// =========================

[
    "search",
    "filterCategory",
    "minPrice",
    "maxPrice"
]
.forEach(id => {

    const element =
        $(id);


    if(!element)
        return;


    element.addEventListener(
        "input",
        loadBazar
    );


    element.addEventListener(
        "change",
        loadBazar
    );

});

// =========================
// TOMIKON BAZÁR - AUTH
// =========================

let authMode = "login";


const loggedOutBox =
    $("loggedOutBox");

const loggedInBox =
    $("loggedInBox");

const authModal =
    $("authModal");

const authTitle =
    $("authTitle");

const authSubmitButton =
    $("authSubmitButton");

const authEmail =
    $("authEmail");

const authPassword =
    $("authPassword");

const authMessage =
    $("authMessage");


// =========================
// ZOBRAZENIE AUTH
// =========================

function openAuth(mode) {

    authMode = mode;

    authModal.style.display =
        "flex";


    authMessage.textContent =
        "";


    if(mode === "login"){

        authTitle.textContent =
            "🔐 Prihlásenie";

        authSubmitButton.textContent =
            "Prihlásiť sa";

    }else{

        authTitle.textContent =
            "✨ Vytvorenie účtu";

        authSubmitButton.textContent =
            "Vytvoriť účet";

    }

}

// =========================================================
// MODERN AUTH MODAL
// =========================================================

const authSwitchButton =
    $("authSwitchButton");

const togglePasswordButton =
    $("togglePasswordButton");


// LOGIN <-> REGISTRÁCIA
if (authSwitchButton) {

    authSwitchButton.addEventListener(
        "click",
        () => {

            if (authMode === "login") {

                openAuth("register");

                authSwitchButton.textContent =
                    "🔐 Už mám účet – prihlásiť sa";

            } else {

                openAuth("login");

                authSwitchButton.textContent =
                    "✨ Chcem si vytvoriť účet";

            }

            authEmail.focus();

        }
    );

}


// ZOBRAZIŤ / SKRYŤ HESLO
if (togglePasswordButton) {

    togglePasswordButton.addEventListener(
        "click",
        () => {

            if (authPassword.type === "password") {

                authPassword.type = "text";

                togglePasswordButton.textContent =
                    "🙈";

            } else {

                authPassword.type = "password";

                togglePasswordButton.textContent =
                    "👁";

            }

        }
    );

}


// KLIKNUTIE MIMO BOXU = ZATVORIŤ
if (authModal) {

    authModal.addEventListener(
        "click",
        (event) => {

            if (event.target === authModal) {

                authModal.style.display =
                    "none";

            }

        }
    );

}


// ESC = ZATVORIŤ
document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            authModal &&
            authModal.style.display === "flex"
        ) {

            authModal.style.display =
                "none";

        }

    }
);


// ENTER V POLI HESLA
if (authPassword) {

    authPassword.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                authSubmitButton.click();

            }

        }
    );

}


// =========================
// ZATVORENIE
// =========================

$("closeAuthButton")
.addEventListener(
    "click",
    () => {

        authModal.style.display =
            "none";

    }
);


// =========================
// LOGIN
// =========================

$("showLoginButton")
.addEventListener(
    "click",
    () => {

        openAuth("login");

    }
);


// =========================
// REGISTRÁCIA
// =========================

$("showRegisterButton")
.addEventListener(
    "click",
    () => {

        openAuth("register");

    }
);


// =========================
// PRIHLÁSENIE / REGISTRÁCIA
// =========================

authSubmitButton
.addEventListener(
    "click",
    async () => {

        const email =
            authEmail.value
                .trim();

        const password =
            authPassword.value;


        if(!email || !password){

            authMessage.textContent =
                "❌ Vyplň e-mail a heslo.";

            return;

        }


        authSubmitButton.disabled =
            true;


        authMessage.textContent =
            "⏳ Pracujem...";


        // =========================
        // REGISTRÁCIA
        // =========================

        if(authMode === "register"){

           const {
    data,
    error
} =
    await bazarClient.auth.signUp({

        email,
        password,

        options: {

            emailRedirectTo:
                "https://tomistore.sk/bazar.html"

        }

    });


            if(error){

                console.error(
                    "REGISTER ERROR:",
                    error
                );


                authMessage.textContent =
                    "❌ " + error.message;

                authSubmitButton.disabled =
                    false;

                return;

            }


            if(!data.session){

                authMessage.textContent =
                    "✅ Účet bol vytvorený. " +
                    "Skontroluj e-mail a potvrď registráciu.";

            }else{

                authMessage.textContent =
                    "✅ Účet bol vytvorený.";

                authModal.style.display =
                    "none";

            }


            authSubmitButton.disabled =
                false;

            return;

        }


        // =========================
        // PRIHLÁSENIE
        // =========================

        const {
    data,
    error
} =
    await bazarClient.auth
    .signInWithPassword({
        email,
        password
    });

        if(error){

            console.error(
                "LOGIN ERROR:",
                error
            );


            authMessage.textContent =
                "❌ Nesprávny e-mail alebo heslo.";

            authSubmitButton.disabled =
                false;

            return;

        }


        authModal.style.display =
            "none";


        authEmail.value =
            "";

        authPassword.value =
            "";


        await updateAuthUI(data?.user || null);

    }
);


// =========================
// AUTH UI
// =========================

async function updateAuthUI(user = null){

    const sidebarLoggedInMenu =
        document.getElementById(
            "sidebarLoggedInMenu"
        );

    const sidebarLoggedInAuth =
        document.getElementById(
            "sidebarLoggedInAuth"
        );

    const sidebarLoggedOutAuth =
        document.getElementById(
            "sidebarLoggedOutAuth"
        );

    const sidebarUserEmail =
        document.getElementById(
            "sidebarUserEmail"
        );


    // =========================================
    // PRIHLÁSENÝ
    // =========================================

    if(user){

        if(sidebarLoggedInMenu){
            sidebarLoggedInMenu.style.display =
                "block";
        }

        if(sidebarLoggedInAuth){
            sidebarLoggedInAuth.style.display =
                "block";
        }

        if(sidebarLoggedOutAuth){
            sidebarLoggedOutAuth.style.display =
                "none";
        }

        if(sidebarUserEmail){
            sidebarUserEmail.textContent =
                user.email || "";
        }

        return;
    }


    // =========================================
    // ODHLÁSENÝ
    // =========================================

    if(sidebarLoggedInMenu){
        sidebarLoggedInMenu.style.display =
            "none";
    }

    if(sidebarLoggedInAuth){
        sidebarLoggedInAuth.style.display =
            "none";
    }

    if(sidebarLoggedOutAuth){
        sidebarLoggedOutAuth.style.display =
            "block";
    }

    if(sidebarUserEmail){
        sidebarUserEmail.textContent = "";
    }

}


// =========================
// ODHLÁSENIE
// =========================

const sidebarLogoutButton =
    document.getElementById(
        "sidebarLogoutButton"
    );


if(sidebarLogoutButton){

    sidebarLogoutButton.addEventListener(
        "click",
        async function(){

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


            // UI okamžite prepneme
            await updateAuthUI(null);

        }
    );

}


// =========================
// MOJE INZERÁTY
// =========================

const sidebarMyListingsButton =
    document.getElementById(
        "sidebarMyListingsButton"
    );


if(sidebarMyListingsButton){

    sidebarMyListingsButton.addEventListener(
        "click",
        function(){

            window.location.href =
                "moje-inzeraty.html";

        }
    );

}

// =========================
// SPRÁVY
// =========================

const sidebarMessagesButton =
    document.getElementById(
        "sidebarMessagesButton"
    );

if(sidebarMessagesButton){

    sidebarMessagesButton.addEventListener(
        "click",
        function(){

            window.location.href =
                "spravy.html";

        }
    );

}

// =========================
// AUTH STATE
// =========================

bazarClient.auth.onAuthStateChange(
    function(event, session){

        console.log(
            "TOMIKON AUTH:",
            event,
            session?.user?.email ||
                "odhlásený"
        );


        updateAuthUI(
            session?.user || null
        );

    }
);


// =========================
// SPUSTENIE AUTH
// =========================

(async function(){

    const {
        data,
        error
    } =
        await bazarClient.auth.getSession();


    if(error){

        console.error(
            "SESSION ERROR:",
            error
        );

        await updateAuthUI(null);

        return;
    }


    await updateAuthUI(
        data.session?.user || null
    );

})();


// =========================
// SPUSTENIE BAZÁRU
// =========================

updateAuthUI();
// =========================
// SPUSTENIE
// =========================

loadBazar();
