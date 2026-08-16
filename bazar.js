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

const bazarImagesInput =
    $("bazarImages");

const imagePreview =
    $("imagePreview");


if(bazarImagesInput){

    bazarImagesInput.addEventListener(
        "change",
        function(){

            if(!imagePreview)
                return;


            imagePreview.innerHTML = "";


            const files =
                Array.from(
                    bazarImagesInput.files
                );


            // MAX 8 FOTIEK

            if(files.length > 8){

                alert(
                    "Môžeš vybrať maximálne 8 fotiek."
                );

                bazarImagesInput.value = "";

                return;
            }


            files.forEach(file => {

                if(!file.type.startsWith("image/")){

                    return;

                }


                if(
                    file.size >
                    10 * 1024 * 1024
                ){

                    alert(
                        `Fotka "${file.name}" je väčšia ako 10 MB.`
                    );

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function(event){

                        const img =
                            document.createElement("img");


                        img.src =
                            event.target.result;


                        img.style.width =
                            "120px";

                        img.style.height =
                            "90px";

                        img.style.objectFit =
                            "cover";

                        img.style.borderRadius =
                            "8px";

                        img.style.border =
                            "1px solid #008cff";


                        imagePreview.appendChild(
                            img
                        );

                    };


                reader.readAsDataURL(file);

            });

        }
    );

}


// =========================
// NAČÍTANIE INZERÁTOV
// =========================

async function loadBazar(){

    const listings =
        $("bazarListings");


    if(!listings)
        return;


    let query =
        bazarClient
        .from("bazar_listings")
        .select(`
            id,
            title,
            category,
            price,
            city,
            contact,
            description,
            created_at
        `)
        .eq("approved", true)
        .order("created_at", {
            ascending:false
        });


    // =========================
    // VYHĽADÁVANIE
    // =========================

    const search =
        $("search").value.trim();


    const category =
        $("filterCategory").value;


    const minPrice =
        $("minPrice").value;


    const maxPrice =
        $("maxPrice").value;


    if(search){

        query =
            query.or(
                `title.ilike.%${search}%,description.ilike.%${search}%`
            );

    }


    if(category){

        query =
            query.eq(
                "category",
                category
            );

    }


    if(minPrice){

        query =
            query.gte(
                "price",
                Number(minPrice)
            );

    }


    if(maxPrice){

        query =
            query.lte(
                "price",
                Number(maxPrice)
            );

    }


    const {
        data,
        error
    } =
        await query;


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
        // FOTKY
        // =========================

        let imagesHTML = "";


        if(listingImages.length > 0){

            imagesHTML = `

                <div
                    class="bazar-images"
                    style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:10px;
                        margin-bottom:15px;
                    "
                >

                    ${listingImages.map(image => `

                        <img
                            src="${escapeHTML(image.image_url)}"
                            alt="${escapeHTML(listing.title)}"
                            style="
                                width:180px;
                                height:135px;
                                object-fit:cover;
                                border-radius:10px;
                                border:1px solid #008cff;
                                cursor:pointer;
                            "
                            onclick="
                                window.open(
                                    '${escapeHTML(image.image_url)}',
                                    '_blank'
                                )
                            "
                        >

                    `).join("")}

                </div>

            `;

        }else{

            imagesHTML = `

                <div
                    style="
                        font-size:42px;
                        margin-bottom:10px;
                    "
                >
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


            <p>

                ${escapeHTML(
                    listing.description
                )}

            </p>


            <div class="bazar-meta">

                📞 ${escapeHTML(
                    listing.contact
                )}

            </div>


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
                    password

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


        await updateAuthUI();

    }
);


// =========================
// AUTH UI
// =========================

async function updateAuthUI(){

    const {
        data
    } =
        await bazarClient.auth.getSession();


    const user =
        data.session?.user;


    if(user){

        loggedOutBox.style.display =
            "none";


        loggedInBox.style.display =
            "block";


        $("userEmail")
            .textContent =
            "👤 " + user.email;


    }else{

        loggedOutBox.style.display =
            "block";


        loggedInBox.style.display =
            "none";

    }

}


// =========================
// ODHLÁSENIE
// =========================

$("logoutBazarButton")
.addEventListener(
    "click",
    async () => {

        await bazarClient.auth.signOut();

        await updateAuthUI();

    }
);


// =========================
// SPUSTENIE AUTH
// =========================

updateAuthUI();
// =========================
// SPUSTENIE
// =========================

loadBazar();
