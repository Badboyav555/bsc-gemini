// Supabase Configuration Hook Configuration
const SUPABASE_URL = "YOUR_SUPABASE_URL"; 
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

let supabaseClient = null;
if (typeof supabase !== 'undefined' && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Global Search Routing Logic
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("globalSearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const elementsToFilter = document.querySelectorAll("[data-searchable]");
            
            elementsToFilter.forEach(item => {
                const text = item.getAttribute("data-searchable").toLowerCase();
                if (text.includes(query)) {
                    item.style.display = "";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }
});

// URL Param Extraction Utility
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        sem: params.get("sem"),
        subject: params.get("subject"),
        note: params.get("note")
    };
}
