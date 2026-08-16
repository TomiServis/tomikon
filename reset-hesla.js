const SUPABASE_URL =
    "https://sjhlzllylobreeehziae.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_3GLcmT1aTqaGija1nFtziA_iGUYqt7_";


const bazarClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


const form =
    document.getElementById(
        "resetPasswordForm"
    );


const newPassword =
    document.getElementById(
        "newPassword"
    );


const confirmPassword =
    document.getElementById(
        "confirmPassword"
    );


const resetButton =
    document.getElementById(
        "resetPasswordButton"
    );


const message =
    document.getElementById(
        "resetMessage"
    );


// =====================================================
// RESET HESLA
// =====================================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const password =
            newPassword.value;

        const confirmation =
            confirmPassword.value;


        // -------------------------
        // KONTROLA HESLA
        // -------------------------

        if (password.length < 6) {

            message.textContent =
                "❌ Heslo musí mať aspoň 6 znakov.";

            return;

        }


        if (password !== confirmation) {

            message.textContent =
                "❌ Heslá sa nezhodujú.";

            return;

        }


        resetButton.disabled =
            true;

        resetButton.textContent =
            "⏳ Mením heslo...";

        message.textContent =
            "🔐 Aktualizujem tvoje heslo...";


        // -------------------------
        // SUPABASE
        // -------------------------

        const {
            error
        } =
            await bazarClient.auth.updateUser({

                password:
                    password

            });


        if (error) {

            console.error(
                "PASSWORD UPDATE ERROR:",
                error
            );


            message.textContent =
                "❌ " + error.message;


            resetButton.disabled =
                false;

            resetButton.textContent =
                "🔐 Zmeniť heslo";

            return;

        }


        // -------------------------
        // ÚSPECH
        // -------------------------

        message.textContent =
            "✅ Heslo bolo úspešne zmenené!";


        resetButton.textContent =
            "✅ Heslo zmenené";


        newPassword.value =
            "";

        confirmPassword.value =
            "";


        setTimeout(
            () => {

                window.location.href =
                    "bazar.html";

            },
            2000
        );

    }
);
