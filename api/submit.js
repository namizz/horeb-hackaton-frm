const { google } = require("googleapis");
const express = require("express");

// For Vercel, use serverless export
const app = express();
app.use(express.json());

app.post("/", async (req, res) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // Your Sheet ID

    const formData = req.body; // Data from frontend POST

    // Prepare row (matches Sheet headers)
    const row = [
      new Date().toLocaleString(), // Timestamp
      formData.name || "",
      formData.department || "",
      formData.year || "",
      formData.team || "",
      formData.role || "",
      formData.category || formData.profession || "", // Combined
      formData.expectations || "",
    ];

    // Append to Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:H", // Adjust if your sheet name differs
      valueInputOption: "USER_ENTERED",
      resource: { values: [row] },
    });

    res
      .status(200)
      .json({ success: true, message: "Data saved to Google Sheet!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = app;
