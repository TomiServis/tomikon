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
// NÁHĽADY FOTIEK
// =========================

const bazarImagesInput =
    document.getElementById("bazarImages");

const imagePreview =
    document.getElementById("imagePreview");


if (bazarImagesInput) {

    bazarImagesInput.addEventListener(
        "change",
        function () {

            imagePreview.innerHTML = "";

            const files =
                Array.from(
                    bazarImagesInput.files
                );


            // MAX 8 FOTIEK

            if (files.length > 8) {

                alert(
                    "Môžeš vybrať maximálne 8 fotiek."
                );

                bazarImagesInput.value = "";

                return;
            }


            files.forEach(file => {

                // KONTROLA TYPU

                if (!file.type.startsWith("image/")) {

                    return;

                }


                // KONTROLA VEĽKOSTI

                if (file.size > 10 * 1024 * 1024) {

                    alert(
                        `Fotka "${file.name}" je väčšia ako 10 MB.`
                    );

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

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
// NAČÍTANIE INZERÁTOV
// =========================

async function loadBazar(){

    const listings =
        $("bazarListings");


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


        card.innerHTML =
            `

            <div
                style="
                    font-size:42px;
                    margin-bottom:10px;
                "
            >
                🖥️
            </div>


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


        // =========================
        // ODOSLANIE
        // =========================

        const {
            error
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

            });


        // =========================
        // CHYBA
        // =========================

        if(error){

            console.error(
                "BAZAR INSERT ERROR:",
                error
            );


            message.textContent =
                "❌ " + error.message;

            return;

        }


        // =========================
        // ÚSPECH
        // =========================

        $("bazarForm")
        .reset();


        message.textContent =
            "✅ Inzerát bol odoslaný. " +
            "Čaká na schválenie administrátorom.";


        await loadBazar();

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
// SPUSTENIE
// =========================

loadBazar();
