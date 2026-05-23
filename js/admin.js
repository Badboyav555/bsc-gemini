let localLeadsMemory = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchLeadsFromSupabase();

    const mdInput = document.getElementById("markdownInput");
    const previewContainer = document.getElementById("livePreviewContainer");

    if (mdInput && previewContainer) {
        mdInput.addEventListener("input", (e) => {
            previewContainer.innerHTML = marked.parse(e.target.value);
        });
    }

    const leadSearch = document.getElementById("leadSearch");
    if(leadSearch) {
        leadSearch.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            renderLeadsRows(localLeadsMemory.filter(l => 
                l.name.toLowerCase().includes(query) || 
                l.mobile.includes(query) || 
                l.subject.toLowerCase().includes(query)
            ));
        });
    }
});

function switchSection(id) {
    document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active-section"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    
    document.getElementById(id).classList.add("active-section");
    event.currentTarget.classList.add("active");
}

async function fetchLeadsFromSupabase() {
    const tBody = document.getElementById("leadsTableBody");
    if (!supabaseClient) {
        tBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted)">Supabase Configuration Keys Missing. Local Demo Isolation mode only.</td></tr>`;
        return;
    }

    try {
        const { data, error } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
        if(error) throw error;
        localLeadsMemory = data;
        renderLeadsRows(data);
    } catch (err) {
        tBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:#dc2626">Failed syncing live parameters engine: ${err.message}</td></tr>`;
    }
}

function renderLeadsRows(array) {
    const tBody = document.getElementById("leadsTableBody");
    tBody.innerHTML = "";
    
    if(array.length === 0) {
        tBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted)">Zero target rows inside leads structure record matrix.</td></tr>`;
        return;
    }

    array.forEach(lead => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-weight:500;">${lead.name}</td>
            <td>${lead.mobile}</td>
            <td><span style="font-size:0.8rem; background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; font-weight:500;">Sem ${lead.semester} - ${lead.subject.toUpperCase()} (${lead.note_title})</span></td>
            <td style="color:var(--text-muted); font-size:0.8rem;">${new Date(lead.created_at).toLocaleString()}</td>
            <td><button class="btn-danger-sm" onclick="dropLeadSequence('${lead.id}')">Delete</button></td>
        `;
        tBody.appendChild(tr);
    });
}

async function dropLeadSequence(id) {
    if(!confirm("Purge tracking record entry out of secure memory storage?")) return;
    if(supabaseClient) {
        try {
            const { error } = await supabaseClient.from('leads').delete().eq('id', id);
            if(error) throw error;
            fetchLeadsFromSupabase();
        } catch(err) { alert("Deletion failure: " + err.message); }
    }
}

function exportLeadsCSV() {
    if(localLeadsMemory.length === 0) { alert("No rows present for structured extraction."); return; }
    let csvContent = "data:text/csv;charset=utf-8,ID,Name,Mobile,Semester,Subject,NoteUnit,Timestamp\n";
    
    localLeadsMemory.forEach(l => {
        csvContent += `"${l.id}","${l.name}","${l.mobile}","${l.semester}","${l.subject}","${l.note_title}","${l.created_at}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BSc_Nexus_Leads_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generateNoteMetadataLink() {
    const sem = prompt("Target Semester number? (1-6)","1");
    const sub = prompt("Target Subject key? (physics, chemistry, botany, zoology, maths)","physics");
    const unit = prompt("Target Unit key? (unit1, unit2, etc)","unit1");
    
    if(sem && sub && unit) {
        const builtUrl = `${window.location.origin}/notes.html?sem=${sem}&subject=${sub.toLowerCase().trim()}&note=${unit.toLowerCase().trim()}`;
        alert(`Target production link mapped successfully:\n\n${builtUrl}`);
    }
}
