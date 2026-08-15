const REVIEWS_SUPABASE_URL =
"https://sjhlzllylobreeehziae.supabase.co";

const REVIEWS_SUPABASE_KEY =
"sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_";


const reviewsClient =
window.supabase.createClient(
    REVIEWS_SUPABASE_URL,
    REVIEWS_SUPABASE_KEY
);


// =================================
// NAČÍTANIE RECENZIÍ
// =================================

async function loadPublicReviews(){

    const list =
        document.getElementById("reviewsList");

    if(!list) return;


    const { data, error } =
        await reviewsClient
        .from("reviews")
        .select("id,name,rating,text,created_at")
        .eq("approved", true)
        .order("created_at", {
            ascending:false
        });


    if(error){

        console.error(error);

        list.innerHTML =
        "<p>Nepodarilo sa načítať recenzie.</p>";

        return;
    }


    if(!data || data.length === 0){

        list.innerHTML =
        "<p>Zatiaľ nemáme žiadne recenzie.</p>";

        return;
    }


    list.innerHTML = "";


    data.forEach(review => {

        const card =
            document.createElement("div");

        card.className =
            "public-review-card";


        const stars =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);


        const name =
            escapeReviewHTML(review.name);

        const text =
            escapeReviewHTML(review.text);


        card.innerHTML = `

            <div class="public-review-stars">
                ${stars}
            </div>

            <p class="public-review-text">
                "${text}"
            </p>

            <strong>
                — ${name}
            </strong>

        `;


        list.appendChild(card);

    });

}


// =================================
// ODOSLANIE RECENZIE
// =================================

const reviewForm =
document.getElementById("reviewForm");


if(reviewForm){

    reviewForm.addEventListener(
        "submit",
        async function(event){

            event.preventDefault();


            const name =
                document.getElementById(
                    "reviewName"
                ).value.trim();


            const rating =
                Number(
                    document.getElementById(
                        "reviewRating"
                    ).value
                );


            const text =
                document.getElementById(
                    "reviewText"
                ).value.trim();


            const message =
                document.getElementById(
                    "reviewMessage"
                );


            message.textContent =
                "Odosielam...";


            const { error } =
                await reviewsClient
                .from("reviews")
                .insert({

                    name:name,

                    rating:rating,

                    text:text,

                    approved:false

                });


            if(error){

                console.error(error);

                message.textContent =
                    "❌ Recenziu sa nepodarilo odoslať.";

                return;
            }


            reviewForm.reset();


            message.textContent =
                "✅ Ďakujeme! Recenzia čaká na schválenie.";

        }
    );

}


// =================================
// OCHRANA TEXTU
// =================================

function escapeReviewHTML(text){

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// =================================
// SPUSTENIE
// =================================

loadPublicReviews();
