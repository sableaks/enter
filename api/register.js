import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.POSTGRES_URL);

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
    }

    try {
        const { jobId, players } = req.body || {};

        if (!jobId || !Array.isArray(players)) {
            return res.status(400).json({ error: "Invalid data" });
        }

        await sql`
            INSERT INTO servers (job_id, players, updated_at)
            VALUES (${jobId}, ${JSON.stringify(players)}::jsonb, NOW())
            ON CONFLICT (job_id)
            DO UPDATE SET
                players = EXCLUDED.players,
                updated_at = NOW()
        `;

        return res.json({ ok: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Database error" });
    }
}
