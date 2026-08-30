import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL);

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "GET only" });
    }

    try {
        const serverId = req.query.serverId;

        if (!serverId) {
            return res.status(400).json({
                error: "Missing serverId"
            });
        }

        const requests = await sql`
            SELECT id, user_id, job_id
            FROM teleport_requests
            WHERE claimed = FALSE
            AND created_at > NOW() - INTERVAL '30 seconds'
            ORDER BY id ASC
            LIMIT 20
        `;

        const server = await sql`
            SELECT players
            FROM servers
            WHERE job_id = ${serverId}
            AND updated_at > NOW() - INTERVAL '15 seconds'
            LIMIT 1
        `;

        if (server.length === 0) {
            return res.json([]);
        }

        const players = server[0].players;
        const result = [];

        for (const request of requests) {
            if (!players.includes(request.user_id)) {
                continue;
            }

            const claimed = await sql`
                UPDATE teleport_requests
                SET claimed = TRUE
                WHERE id = ${request.id}
                AND claimed = FALSE
                RETURNING id, user_id, job_id
            `;

            if (claimed.length > 0) {
                result.push(claimed[0]);
            }
        }

        return res.json(result);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Database error"
        });
    }
}
