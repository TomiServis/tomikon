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
// POMOCNÁ FUNKCIA
// =========================

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


// =========================
// ELEMENT
// =========================

const detailContent =
    document.getElementById(
        "detailContent"
    );


// =========================
// KONTROLA ID
// =========================

if(!listingId){

    detailContent.innerHTML = `
        <div class="error">
            ❌ Inzerát nebol nájdený.
        </div>
    `;

}else{

    loadListing();

}


// =========================
// NAČÍTANIE INZERÁTU
// =========================

async function loadListing(){

    const {
        data: listing,
        error
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
            created_at
        `)
        .eq("id", listingId)
        .eq("approved", true)
        .single();


    // =========================
    // CHYBA
    // =========================

    if(error){

        console.error(
            "DETAIL ERROR:",
            error
        );

        detailContent.innerHTML = `
            <div class="error">
                ❌ Tento inzerát neexistuje
                alebo ešte nebol schválený.
            </div>
        `;

        return;

    }


    // =========================
    // CENA
    // =========================

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


    // =========================
    // DETAIL
    // =========================

    detailContent.innerHTML = `

        <div class="detail-layout">


            <!-- =====================
                 ĽAVÁ STRANA
            ====================== -->

            <div>

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        min-height:300px;
                        background:#050505;
                        border-radius:12px;
                        border:1px solid #222;
                        font-size:120px;
                    "
                >
                    🖥️
                </div>

            </div>


            <!-- =====================
                 PRAVÁ STRANA
            ====================== -->

            <div>

                <div class="detail-category">

                    ${escapeHTML(
                        listing.category
                    )}

                </div>


                <h2 class="detail-title">

                    ${escapeHTML(
                        listing.title
                    )}

                </h2>


                <div class="detail-price">

                    ${price} €

                </div>


                <div class="detail-info">

                    <div>

                        📍
                        <strong>Mesto:</strong>

                        ${escapeHTML(
                            listing.city
                        )}

                    </div>


                    <div>

                        📅
                        <strong>Pridané:</strong>

                        ${new Date(
                            listing.created_at
                        ).toLocaleDateString(
                            "sk-SK"
                        )}

                    </div>

                </div>


                <div>

                    <h3>
                        📝 Popis
                    </h3>


                    <div class="detail-description">

                        ${escapeHTML(
                            listing.description
                        )}

                    </div>

                </div>


                <div class="contact-box">

                    <h3>
                        📞 Kontakt na predajcu
                    </h3>


                    <div class="contact-value">

                        ${escapeHTML(
                            listing.contact
                        )}

                    </div>

                </div>

            </div>

        </div>

    `;

}
