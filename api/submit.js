import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const data = req.body;
    console.log("Received data:", data);

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const row = [
      data.timestamp || new Date().toLocaleString("en-GB"),
      data.name || "",
      data.department || "",
      data.year || "",
      data.team || "",
      data.role || "",
      data.category || data.profession || "",
      data.expectations || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:H",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Sheet error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
