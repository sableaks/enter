import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    try {
        const { username, jobId } = req.body || {};

        if (!username || !jobId) {
            return res.status(400).json({
                error: "Username and Job ID are required"
            });
        }

        const robloxResponse = await fetch(
            `https://users.roblox.com/v1/users/search?keyword=${encodeURIComponent(username)}&limit=10`
        );

        if (!robloxResponse.ok) {
            return res.status(502).json({
                error: "Roblox API unavailable"
            });
        }

        const robloxData = await robloxResponse.json();

        const user = robloxData.data?.find(
            x => x.name.toLowerCase() === username.toLowerCase()
        );

        if (!user) {
            return res.status(404).json({
                error: "Username not found"
            });
        }

        const userId = String(user.id);

        const server = await sql`
            SELECT job_id
            FROM servers
            WHERE players @> ${JSON.stringify([userId])}::jsonb
            AND updated_at > NOW() - INTERVAL '15 seconds'
            LIMIT 1
        `;

        if (server.length === 0) {
            return res.status(404).json({
                error: "Player is not currently online"
            });
        }

        await sql`
            INSERT INTO teleport_requests (user_id, job_id)
            VALUES (${userId}, ${jobId})
        `;

        return res.json({
            success: true,
            username: user.name,
            userId,
            server: server[0].job_id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error"
        });
    }
}
