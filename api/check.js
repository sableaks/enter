export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (req.body.password === process.env.SITE_PASSWORD) {
    
    // The secret HTML that gets sent ONLY on success
    const secretHtml = `
      <h2>Roblox Teleporter</h2>
      <input id="username" placeholder="Username" autocomplete="off">
      <input id="jobId" placeholder="Destination Job ID" autocomplete="off">
      <button onclick="teleport()">TELEPORT</button>
      <div id="status"></div>
    `;

    // The secret JavaScript that gets sent ONLY on success
    const secretJs = `
      window.teleport = async function() {
        const username = document.getElementById("username").value.trim();
        const jobId = document.getElementById("jobId").value.trim();
        const status = document.getElementById("status");

        if (!username || !jobId) { status.textContent = "Enter a username and Job ID."; return; }
        
        status.textContent = "Finding player...";
        try {
          const response = await fetch("/api/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, jobId })
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Request failed");
          status.textContent = \`Teleport request sent for \${data.username}!\`;
        } catch (error) {
          status.textContent = "Error: " + error.message;
        }
      }
    `;

    return res.status(200).json({ success: true, html: secretHtml, js: secretJs });
  } else {
    return res.status(401).json({ success: false });
  }
}
