import express from "express";
import cors from "cors";
import { Resend } from "resend";
import { config } from "dotenv";

config({
    path: "./.env"
})

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.get('/health', (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.post('/send-email', async (req, res) => {
    let body = req.body;

    if (Buffer.isBuffer(body)) {
        body = body.toString();
    }

    else if (body?.type === "Buffer" && Array.isArray(body.data)) {
        body = Buffer.from(body.data).toString();
    }

    try {
        body = JSON.parse(body);
    } catch (err) {
        console.error("Invalid JSON body:", err);
    }

    const { to, code } = body;

    if (!to || !code) {
        return res.status(400).json({ success: false, message: "Missing to or code", to: to, code: code, body: req?.body });
    }

    try {
        const data = await resend.emails.send({
            from: "FindIt <noreply@avishekadhikary.tech>",
            to: [to],
            subject: "Code for verifying item found",
            html: `
                <!DOCTYPE html>
                <html lang="en" style="margin:0; padding:0;">
                <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Found Item Verification</title>
                <style>
                    body {
                    background-color: #f4f4f7;
                    font-family: 'Segoe UI', sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #333;
                    }
                    .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .header {
                    background-color: #2f80ed;
                    color: white;
                    padding: 20px 0px;
                    text-align: center;
                    }
                    .header h1 {
                    margin: 0;
                    font-size: 24px;
                    }
                    .content {
                    padding: 30px;
                    line-height: 1.6;
                    }
                    .code-box {
                    text-align: center;
                    margin: 30px 0;
                    }
                    .code {
                    display: inline-block;
                    font-size: 28px;
                    background-color: #eaf1fb;
                    color: #2f80ed;
                    padding: 14px 30px;
                    border-radius: 6px;
                    letter-spacing: 4px;
                    font-weight: bold;
                    }
                    .footer {
                    font-size: 13px;
                    color: #888;
                    text-align: center;
                    padding: 20px;
                    }
                </style>
                </head>
                <body>

                <div class="container">
                    <div class="header">
                    <h1>Found item verification code</h1>
                    </div>
                    <div class="content">
                    <p>Hi there,</p>
                    <p>Thank you for using <strong>FindIt</strong>!</p>

                    <div class="code-box">
                        <div class="code">${code}</div>
                    </div>

                    <h3>Keep this code safe—you’ll need it later, when your item is found !</h3>

                    <p>This code is used to verify the user who has found your item. If someone finds your lost item, they will contact you. After you confirm that the item is indeed with them, you can share this code. The finder will then use it to update the item's status from "Not Found" to "Found".</p>

                    <p>If you didn’t request this code, you can safely ignore this email.</p>

                    <p>Thanks,<br>The FindIt Team</p>
                    </div>
                    <div class="footer">
                    &copy; 2025 FindIt. All rights reserved.
                    </div>
                </div>

                </body>
                </html>
            `
        })

        res.status(200).json({ success: true, data: data || null });
    }
    catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
export default app;