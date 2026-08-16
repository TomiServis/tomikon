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
// ID INZERÁTU Z URL
// =========================

const params =
    new URLSearchParams(
        window.location.search
    );

const listingId =
    params.get("id");


console.log(
    "ID INZERÁTU:",
    listingId
);


// =========================
// KONTROLA ID
// =========================

if(!listingId){

    $("loadingBox").style.display =
        "none";

    $("errorBox").style.display =
        "block";

}else{

    loadDetail();

}


// =========================
// NAČÍTANIE DETAILU
// =========================

async function loadDetail(){

    try{

        const {
            data: listing,
            error: listingError
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
                    created_at,
                    approved
                `)
                .eq("id", listingId)
                .eq("approved", true)
                .single();


        // =========================
        // CHYBA INZERÁTU
        // =========================

        if(listingError){

            console.error(
                "LISTING ERROR:",
                listingError
            );

            showError();

            return;
        }


        if(!listing){

            showError();

            return;
        }


        // =========================
        // NAČÍTANIE FOTIEK
        // =========================

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
                .eq(
                    "listing_id",
                    listingId
                )
                .order(
                    "sort_order",
                    {
                        ascending:true
                    }
                );


        if(imagesError){

            console.error(
                "IMAGES ERROR:",
                imagesError
            );

        }


        // =========================
        // VYPLNENIE ÚDAJOV
        // =========================

        $("detailCategory")
            .textContent =
            listing.category || "";


        $("detailTitle")
            .textContent =
            listing.title || "";


        $("detailPrice")
            .textContent =
            Number(
                listing.price
            ).toLocaleString(
                "sk-SK",
                {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                }
            ) + " €";


        $("detailCity")
            .textContent =
            listing.city || "";


        $("detailContact")
            .textContent =
            listing.contact || "";


        $("detailDescription")
            .textContent =
            listing.description || "";


        $("detailDate")
            .textContent =
            new Date(
                listing.created_at
            ).toLocaleDateString(
                "sk-SK"
            );


        // =========================
        // FOTKY
        // =========================

        const validImages =
            images || [];


        if(validImages.length > 0){

            setMainImage(
                validImages[0].image_url
            );


            renderThumbnails(
                validImages
            );

        }else{

            $("mainImage").style.display =
                "none";

            $("thumbnails").innerHTML =
                `
                <div style="
                    width:100%;
                    text-align:center;
                    color:#777;
                    padding:30px;
                ">
                    🖥️ Inzerát nemá fotografie
                </div>
                `;

        }


        // =========================
        // ZOBRAZIŤ DETAIL
        // =========================

        $("loadingBox").style.display =
            "none";

        $("detailBox").style.display =
            "block";

    }
    catch(error){

        console.error(
            "DETAIL ERROR:",
            error
        );

        showError();

    }

}


// =========================
// HLAVNÁ FOTKA
// =========================

function setMainImage(url){

    const mainImage =
        $("mainImage");

    mainImage.src =
        url;

    mainImage.onclick =
        function(){

            openImageModal(url);

        };

}


// =========================
// NÁHĽADY FOTIEK
// =========================

function renderThumbnails(images){

    const container =
        $("thumbnails");

    container.innerHTML =
        "";


    images.forEach(
        (image,index) => {

            const img =
                document.createElement("img");

            img.className =
                "thumbnail";


            if(index === 0){

                img.classList.add(
                    "active"
                );

            }


            img.src =
                image.image_url;


            img.alt =
                "Fotka inzerátu";


            img.addEventListener(
                "click",
                function(){

                    setMainImage(
                        image.image_url
                    );


                    document
                        .querySelectorAll(
                            ".thumbnail"
                        )
                        .forEach(
                            thumbnail => {

                                thumbnail.classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    img.classList.add(
                        "active"
                    );

                }
            );


            container.appendChild(
                img
            );

        }
    );

}


// =========================
// LIGHTBOX
// =========================

function openImageModal(url){

    $("modalImage").src =
        url;

    $("imageModal").style.display =
        "flex";

}


$("closeImageModal")
    .addEventListener(
        "click",
        function(){

            $("imageModal").style.display =
                "none";

        }
    );


$("imageModal")
    .addEventListener(
        "click",
        function(event){

            if(
                event.target ===
                $("imageModal")
            ){

                $("imageModal").style.display =
                    "none";

            }

        }
    );


// =========================
// CHYBA
// =========================

function showError(){

    $("loadingBox").style.display =
        "none";

    $("detailBox").style.display =
        "none";

    $("errorBox").style.display =
        "block";

}
