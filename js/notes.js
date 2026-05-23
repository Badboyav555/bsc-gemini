document.addEventListener("DOMContentLoaded", () => {
    const { sem, subject, note } = getUrlParams();
    if(!sem || !subject || !note) { window.location.href = "index.html"; return; }

    // Navigation setup
    document.getElementById("navBack").href = `subject.html?sem=${sem}&subject=${subject}`;
    document.getElementById("docHeaderTitle").innerText = `${subject.toUpperCase()} - ${note.toUpperCase()}`;

    const langToggle = document.getElementById("langToggle");
    const loader = document.getElementById("loadingScreen");
    const errorCard = document.getElementById("errorCard");
    const mDRender = document.getElementById("markdownRender");
    const lockOverlay = document.getElementById("lockOverlay");
    const assetBar = document.getElementById("assetBar");

    // Dynamic PDF checks configuration paths hooks targets directly
    setupAssetLinks(sem, subject, note);

    langToggle.addEventListener("change", () => loadMarkdownContent());
    
    // Core Fetch Handler Execution
    async function loadMarkdownContent() {
        loader.style.display = "flex";
        errorCard.style.display = "none";
        mDRender.innerHTML = "";
        
        const currentLang = langToggle.value;
        const filePath = `notes/sem${sem}/${subject}/${note}-${currentLang}.md`;
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error("File missing asset route context error.");
            
            let markdownText = await response.text();
            loader.style.display = "none";
            
            // Check Lock State System Authorization Rulesets
            const isUnlocked = localStorage.getItem(`unlocked_sem${sem}_${subject}_${note}`) || localStorage.getItem("global_access_unlocked");
            
            if (!isUnlocked) {
                // Intercept and slice exactly down to rough 30% lines safely
                const lines = markdownText.split("\n");
                const partialLinesCount = Math.ceil(lines.length * 0.3);
                markdownText = lines.slice(0, partialLinesCount).join("\n");
                lockOverlay.style.display = "flex";
                mDRender.classList.add("blurred-view");
            } else {
                lockOverlay.style.display = "none";
                mDRender.classList.remove("blurred-view");
            }

            renderMarkdown(markdownText);
            generateTOC();
            setupImageZoom();

        } catch (err) {
            loader.style.display = "none";
            errorCard.style.display = "block";
        }
    }

    function renderMarkdown(text) {
        // Intercept standard marked operations custom wrap structures definitions rules
        const htmlContent = marked.parse(text);
        mDRender.innerHTML = htmlContent;

        // Code block formatting and wrap logic
        mDRender.querySelectorAll("pre").forEach(pre => {
            const wrapper = document.createElement("div");
            wrapper.className = "code-block-wrapper";
            const header = document.createElement("div");
            header.className = "code-block-header";
            header.innerHTML = `<button class="copy-btn" onclick="copyCode(this)">Copy</button>`;
            
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);
        });

        // Table encapsulation rulesets prevent breakouts on screens
        mDRender.querySelectorAll("table").forEach(table => {
            const wrap = document.createElement("div");
            wrap.className = "table-wrapper";
            table.parentNode.insertBefore(wrap, table);
            wrap.appendChild(table);
        });
    }

    function generateTOC() {
        const tocContent = document.getElementById("tocContent");
        tocContent.innerHTML = "";
        const headings = mDRender.querySelectorAll("h1, h2, h3");
        
        if(headings.length === 0) {
            tocContent.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted)">No segments found.</p>`;
            return;
        }

        headings.forEach((heading, idx) => {
            const id = `heading-${idx}`;
            heading.id = id;
            const link = document.createElement("a");
            link.href = `#${id}`;
            link.innerText = heading.innerText;
            link.style.display = "block";
            link.style.textDecoration = "none";
            link.style.color = "var(--text-muted)";
            link.style.fontSize = "0.85rem";
            link.style.marginBottom = "0.5rem";
            link.style.paddingLeft = heading.tagName === "H2" ? "0.5rem" : heading.tagName === "H3" ? "1rem" : "0px";
            
            link.addEventListener("click", (e) => {
                e.preventDefault();
                heading.scrollIntoView({ behavior: "smooth" });
            });
            tocContent.appendChild(link);
        });
    }

    // Lead Form Submissions Channeling Processing
    const leadForm = document.getElementById("leadForm");
    leadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("leadName").value;
        const phone = document.getElementById("leadPhone").value;

        if (supabaseClient) {
            try {
                const { error } = await supabaseClient.from('leads').insert([
                    { name: name, mobile: phone, semester: sem, subject: subject, note_title: note }
                ]);
                if (error) throw error;
            } catch (err) {
                console.error("Lead retention pipeline sync degradation: ", err);
            }
        }

        localStorage.setItem(`unlocked_sem${sem}_${subject}_${note}`, "true");
        window.location.reload();
    });

    // Tracking progress indicator transformations viewport watchers
    window.addEventListener("scroll", () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
        document.getElementById("progressBar").style.width = scrolled + "%";
    });

    function setupImageZoom() {
        mDRender.querySelectorAll("img").forEach(img => {
            img.setAttribute("loading", "lazy");
            img.addEventListener("click", () => {
                document.getElementById("zoomImg").src = img.src;
                document.getElementById("zoomModal").style.display = "flex";
            });
        });
    }

    function setupAssetLinks(sem, subject, note) {
        const pdfPath = `pdfs/sem${sem}/${subject}/${note}.pdf`;
        document.getElementById("downloadPdfBtn").href = pdfPath;
        document.getElementById("previewPdfBtn").onclick = () => {
            window.open(pdfPath, '_blank');
        };
        assetBar.style.display = "flex";
    }

    // Initialize execution run sequence loops
    loadMarkdownContent();
});

function copyCode(btn) {
    const pre = btn.closest(".code-block-wrapper").querySelector("pre");
    navigator.clipboard.writeText(pre.innerText.replace("Copy", "").trim());
    btn.innerText = "Copied!";
    setTimeout(() => { btn.innerText = "Copy"; }, 2000);
}
