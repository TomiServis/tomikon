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
                    approved,
                    views
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
// ZVÝŠENIE ZOBRAZENÍ
// =========================

const { error: viewsError } =
    await bazarClient.rpc(
        "increment_listing_views",
        {
            p_listing_id: Number(listingId)
        }
    );

if (viewsError) {
    console.error(
        "VIEWS ERROR:",
        viewsError
    );
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


       // =========================
// KLIKNUTEĽNÝ KONTAKT
// =========================

const contactElement =
    $("detailContact");

const contact =
    (listing.contact || "").trim();


if (!contact) {

    contactElement.textContent =
        "Kontakt nie je uvedený.";

} else {

    // =========================
    // E-MAIL
    // =========================

    if (contact.includes("@")) {

        const email =
            contact.replace(/\s/g, "");

        contactElement.innerHTML = `
            <a
                href="mailto:${escapeHTML(email)}"
                class="contact-link email-link"
            >
                ✉️ ${escapeHTML(email)}
            </a>
        `;

    }

    // =========================
    // TELEFÓN
    // =========================

    else {

        const phone =
            contact.replace(/[^\d+]/g, "");

        contactElement.innerHTML = `
            <a
                href="tel:${escapeHTML(phone)}"
                class="contact-link phone-link"
            >
                📞 ${escapeHTML(contact)}
            </a>
        `;

    }

}


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

const viewsElement =
    $("detailViews");

if (viewsElement) {
    viewsElement.textContent =
        Number(listing.views || 0) + 1;
}


// =========================
// FOTKY
// =========================

const validImages = images || [];

// všetky URL fotiek uložíme do galérie
galleryImages = validImages.map(
    image => image.image_url
);

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

            const index =
                galleryImages.indexOf(url);

            openGallery(
                index >= 0 ? index : 0
            );

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

        openGallery(index);


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

// =====================================
// GALÉRIA INZERÁTU
// =====================================

let currentImageIndex = 0;
let galleryImages = [];

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");

const closeImageModal =
    document.querySelector(".gallery-close");

const prevImage =
    document.querySelector(".gallery-prev");

const nextImage =
    document.querySelector(".gallery-next");

const imageCounter =
    document.querySelector(".image-counter");


// =====================================
// OTVORENIE FOTKY
// =====================================

function openGallery(index) {

    if (!galleryImages.length)
        return;

    currentImageIndex = index;

    updateGallery();

    imageModal.style.display = "flex";

    document.body.style.overflow = "hidden";
}


// =====================================
// ZOBRAZENIE FOTKY
// =====================================

function updateGallery() {

    if (!galleryImages.length)
        return;

    modalImage.src =
        galleryImages[currentImageIndex];

    if (imageCounter) {

        imageCounter.textContent =
            `${currentImageIndex + 1} / ${galleryImages.length}`;

    }
}


// =====================================
// ĎALŠIA FOTKA
// =====================================

function showNextImage() {

    if (!galleryImages.length)
        return;

    currentImageIndex++;

    if (
        currentImageIndex >=
        galleryImages.length
    ) {
        currentImageIndex = 0;
    }

    updateGallery();
}


// =====================================
// PREDCHÁDZAJÚCA FOTKA
// =====================================

function showPreviousImage() {

    if (!galleryImages.length)
        return;

    currentImageIndex--;

    if (currentImageIndex < 0) {

        currentImageIndex =
            galleryImages.length - 1;

    }

    updateGallery();
}


// =====================================
// ZATVORENIE
// =====================================

function closeGallery() {

    imageModal.style.display = "none";

    document.body.style.overflow = "";

}


// =====================================
// ŠÍPKY
// =====================================

if (nextImage) {

    nextImage.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            showNextImage();

        }
    );

}


if (prevImage) {

    prevImage.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            showPreviousImage();

        }
    );

}


// =====================================
// X
// =====================================

if (closeImageModal) {

    closeImageModal.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            closeGallery();

        }
    );

}


// =====================================
// KLIKNUTIE MIMO FOTKY
// =====================================

if (imageModal) {

    imageModal.addEventListener(
        "click",
        function(event) {

            // klikol priamo na čierne pozadie
            if (
                event.target === imageModal ||
                event.target.classList.contains("gallery-content")
            ) {

                closeGallery();

            }

        }
    );

}


// =====================================
// KLIKNUTIE NA FOTKU
// FOTKA SA NEZAVRIE
// =====================================

if (modalImage) {

    modalImage.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

        }
    );

}


// =====================================
// KLÁVESNICA
// =====================================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            !imageModal ||
            imageModal.style.display !== "flex"
        ) {
            return;
        }


        if (event.key === "Escape") {

            closeGallery();

        }


        if (event.key === "ArrowRight") {

            showNextImage();

        }


        if (event.key === "ArrowLeft") {

            showPreviousImage();

        }

    }
);
