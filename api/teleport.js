let request = null;

export default function handler(req, res) {
    if (req.method === "POST") {
        const { username, jobId } = req.body || {};

        if (!username || !jobId) {
            return res.status(400).json({
                error: "Missing username or jobId"
            });
        }

        request = {
            username,
            jobId,
            id: Date.now()
        };

        return res.json({ success: true });
    }

    if (req.method === "GET") {
        return res.json(request || {});
    }

    return res.status(405).json({
        error: "Method not allowed"
    });
}
