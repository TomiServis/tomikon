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


let currentUser = null;
let currentConversation = null;
let allMessages = [];


/* =====================================================
   HTML OCHRANA
===================================================== */

function escapeHTML(value){

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =====================================================
   DÁTUM
===================================================== */

function formatDate(date){

    if(!date)
        return "";

    return new Date(date)
        .toLocaleString(
            "sk-SK",
            {
                day:"2-digit",
                month:"2-digit",
                year:"numeric",
                hour:"2-digit",
                minute:"2-digit"
            }
        );
}


/* =====================================================
   NAČÍTANIE PRIHLÁSENÉHO POUŽÍVATEĽA
===================================================== */

async function loadUser(){

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

        return false;
    }


    currentUser =
        data.user;

    return true;

    const userEmail =
    $("messagesUserEmail");

if(userEmail){

    userEmail.textContent =
        currentUser.email || "Neznámy účet";

}
}


/* =====================================================
   NAČÍTANIE SPRÁV
===================================================== */

async function loadMessages(){

    const container =
        $("conversationList");


    container.innerHTML = `

        <div class="messages-loading">

            ⏳ Načítavam správy...

        </div>

    `;


    const {
        data,
        error
    } =
        await bazarClient
            .from("bazar_messages")
            .select(`
                id,
                listing_id,
                sender_id,
                receiver_id,
                message,
                created_at,
                read_at
            `)
            .or(
                `sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`
            )
            .order(
                "created_at",
                {
                    ascending:false
                }
            );


    if(error){

        console.error(
            "MESSAGES LOAD ERROR:",
            error
        );


        container.innerHTML = `

            <div class="messages-loading">

                ❌ Správy sa nepodarilo načítať.

            </div>

        `;

        return;
    }


    allMessages =
        data || [];


    if(
        allMessages.length === 0
    ){

        container.innerHTML = `

            <div class="messages-loading">

                💬 Zatiaľ nemáš žiadne správy.

            </div>

        `;

        return;
    }


    await renderConversations();
}


/* =====================================================
   VYTVORENIE KONVERZÁCIÍ
===================================================== */

async function renderConversations(){

    const container =
        $("conversationList");


    /*
     * Konverzácia je:
     *
     * používateľ + konkrétny inzerát
     */

    const conversations = {};


    allMessages.forEach(
        message => {

            const otherUserId =
                message.sender_id ===
                currentUser.id

                    ? message.receiver_id

                    : message.sender_id;


            const key =
                `${otherUserId}_${message.listing_id}`;


            if(
                !conversations[key]
            ){

                conversations[key] = {

                    otherUserId,

                    listingId:
                        message.listing_id,

                    messages:[]

                };

            }


            conversations[key]
                .messages
                .push(message);

        }
    );


    const conversationArray =
        Object.values(
            conversations
        );


    /*
     * Načítame údaje o inzerátoch
     */

    const listingIds =
        [
            ...new Set(
                conversationArray.map(
                    conversation =>
                        conversation.listingId
                )
            )
        ];


    let listings = [];


    if(listingIds.length){

        const {
            data,
            error
        } =
            await bazarClient
                .from("bazar_listings")
                .select(`
                    id,
                    title,
                    price
                `)
                .in(
                    "id",
                    listingIds
                );


        if(error){

            console.error(
                "LISTINGS ERROR:",
                error
            );

        }else{

            listings =
                data || [];

        }

    }


    const listingMap = {};


    listings.forEach(
        listing => {

            listingMap[
                listing.id
            ] = listing;

        }
    );


    container.innerHTML = "";


    conversationArray.forEach(
        conversation => {

            const messages =
                conversation.messages;


            /*
             * Najnovšia správa
             */

            const latestMessage =
                messages[0];


            const listing =
                listingMap[
                    conversation.listingId
                ];


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "conversation-item";


            item.dataset.userId =
                conversation.otherUserId;


            item.dataset.listingId =
                conversation.listingId;


            const unread =
                messages.some(
                    message =>

                        message.receiver_id ===
                        currentUser.id &&

                        !message.read_at
                );


            item.innerHTML = `

                <div class="conversation-avatar">

                    👤

                </div>


                <div class="conversation-body">

                    <div class="conversation-top">

                        <span
                            class="conversation-name"
                        >
                            Používateľ
                        </span>


                        <span
                            class="conversation-date"
                        >
                            ${formatDate(
                                latestMessage.created_at
                            )}
                        </span>

                    </div>


                    <div
                        class="conversation-listing"
                    >

                        ${
                            listing
                                ? escapeHTML(
                                    listing.title
                                )
                                : "Inzerát"
                        }

                    </div>


                    <div
                        class="conversation-preview"
                    >

                        ${
                            unread
                                ? "🔵 "
                                : ""
                        }

                        ${escapeHTML(
                            latestMessage.message
                        )}

                    </div>

                </div>

            `;


            item.addEventListener(
                "click",
                () => {

                    openConversation(
                        conversation,
                        listing
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   OTVORENIE KONVERZÁCIE
===================================================== */

async function openConversation(
    conversation,
    listing
){

    currentConversation =
        conversation;


    /*
     * Označíme vybranú položku
     */

    document
        .querySelectorAll(
            ".conversation-item"
        )
        .forEach(
            item => {

                item.classList.remove(
                    "active"
                );


                if(
                    item.dataset.userId ===
                        conversation.otherUserId &&

                    item.dataset.listingId ===
                        String(
                            conversation.listingId
                        )
                ){

                    item.classList.add(
                        "active"
                    );

                }

            }
        );


    $("emptyChat").style.display =
        "none";


    $("chatContent").style.display =
        "flex";


    $("chatUser").textContent =
        "Používateľ";


    $("chatListing").textContent =
        listing
            ? listing.title
            : "Inzerát";


    renderChatMessages(
        conversation.messages
    );


    /*
     * Označenie prijatých správ
     * ako prečítaných
     */

    const unreadIds =
        conversation.messages
            .filter(
                message =>

                    message.receiver_id ===
                        currentUser.id &&

                    !message.read_at
            )
            .map(
                message =>
                    message.id
            );


    if(
        unreadIds.length
    ){

        const {
            error
        } =
            await bazarClient
                .from("bazar_messages")
                .update({
                    read_at:
                        new Date().toISOString()
                })
                .in(
                    "id",
                    unreadIds
                );


        if(error){

            console.error(
                "READ UPDATE ERROR:",
                error
            );

        }

    }

}


/* =====================================================
   VYKRESLENIE SPRÁV
===================================================== */

function renderChatMessages(
    messages
){

    const container =
        $("chatMessages");


    container.innerHTML =
        "";


    /*
     * Staršie → novšie
     */

    const sorted =
        [...messages].sort(
            (
                a,
                b
            ) =>
                new Date(
                    a.created_at
                ) -
                new Date(
                    b.created_at
                )
        );


    sorted.forEach(
        message => {

            const sent =
                message.sender_id ===
                currentUser.id;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                sent
                    ? "message-row sent"
                    : "message-row received";


            row.innerHTML = `

                <div class="message-bubble">

                    ${escapeHTML(
                        message.message
                    )}

                    <span
                        class="message-time"
                    >

                        ${formatDate(
                            message.created_at
                        )}

                    </span>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );


    container.scrollTop =
        container.scrollHeight;

}


/* =====================================================
   ODPOVEĎ
===================================================== */

if($("replyForm")){

    $("replyForm")
        .addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if(
                    !currentConversation
                ){

                    return;
                }


                const input =
                    $("replyInput");


                const message =
                    input.value.trim();


                if(!message){

                    return;
                }


                const otherUserId =
                    currentConversation
                        .otherUserId;


                const listingId =
                    currentConversation
                        .listingId;


                const button =
                    document.querySelector(
                        ".reply-button"
                    );


                button.disabled =
                    true;


                button.textContent =
                    "⏳";


                const {
                    error
                } =
                    await bazarClient
                        .from("bazar_messages")
                        .insert({

                            listing_id:
                                listingId,

                            sender_id:
                                currentUser.id,

                            receiver_id:
                                otherUserId,

                            message:
                                message

                        });


                if(error){

                    console.error(
                        "REPLY ERROR:",
                        error
                    );


                    alert(
                        "❌ Správu sa nepodarilo odoslať."
                    );


                    button.disabled =
                        false;

                    button.textContent =
                        "📤 Odoslať";

                    return;
                }


                input.value = "";


                button.disabled =
                    false;

                button.textContent =
                    "📤 Odoslať";


                /*
                 * Načítame znova,
                 * aby sa zobrazila nová správa.
                 */

                await loadMessages();


                /*
                 * Znova otvoríme rovnakú
                 * konverzáciu.
                 */

                const updatedConversation =
                    Object.values(
                        buildConversationObjects()
                    ).find(
                        conversation =>

                            conversation.otherUserId ===
                                otherUserId &&

                            conversation.listingId ===
                                listingId
                    );


                if(updatedConversation){

                    const listing =
                        await getListing(
                            listingId
                        );


                    openConversation(
                        updatedConversation,
                        listing
                    );

                }

            }
        );

}


/* =====================================================
   POMOCNÉ FUNKCIE PRE RELOAD
===================================================== */

function buildConversationObjects(){

    const conversations = {};


    allMessages.forEach(
        message => {

            const otherUserId =
                message.sender_id ===
                currentUser.id

                    ? message.receiver_id

                    : message.sender_id;


            const key =
                `${otherUserId}_${message.listing_id}`;


            if(
                !conversations[key]
            ){

                conversations[key] = {

                    otherUserId,

                    listingId:
                        message.listing_id,

                    messages:[]

                };

            }


            conversations[key]
                .messages
                .push(message);

        }
    );


    return conversations;

}


async function getListing(
    listingId
){

    const {
        data
    } =
        await bazarClient
            .from("bazar_listings")
            .select(`
                id,
                title,
                price
            `)
            .eq(
                "id",
                listingId
            )
            .maybeSingle();


    return data || null;

}


/* =====================================================
   ODHLÁSENIE
===================================================== */

if($("sidebarLogout")){

    $("sidebarLogout")
        .addEventListener(
            "click",
            async () => {

                const {
                    error
                } =
                    await bazarClient
                        .auth
                        .signOut();


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
   REAL-TIME SPRÁVY
===================================================== */

bazarClient
    .channel(
        "bazar-messages-realtime"
    )
    .on(
        "postgres_changes",
        {
            event:"INSERT",
            schema:"public",
            table:"bazar_messages"
        },
        async payload => {

            /*
             * Ak nová správa patrí
             * prihlásenému používateľovi,
             * načítame zoznam znova.
             */

            if(
                !currentUser
            ){

                return;
            }


            const message =
                payload.new;


            if(
                message.sender_id ===
                    currentUser.id ||

                message.receiver_id ===
                    currentUser.id
            ){

                await loadMessages();

            }

        }
    )
    .subscribe();


/* =====================================================
   START
===================================================== */

(async function(){

    const loggedIn =
        await loadUser();


    if(!loggedIn)
        return;


    await loadMessages();

})();
