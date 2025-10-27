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

    const { to, code, photoUrl, itemDescription, location, postedAt, contact } = body;

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
                <meta name="format-detection" content="telephone=no">
                <meta name="format-detection" content="address=no">
                <meta name="format-detection" content="email=no">
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
                      max-width: 680px;
                      margin: 40px auto;
                      background: #ffffff;
                      border-radius: 10px;
                      overflow: hidden;
                      box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                    }
                    .header {
                      background-color: #2f80ed;
                      color: white;
                      padding: 20px 18px;
                      text-align: center;
                    }
                    .header h1 {
                      margin: 0;
                      font-size: 22px;
                      font-weight: 600;
                    }
                    .content {
                      padding: 26px;
                      line-height: 1.6;
                      color: #334155;
                    }
                    /* Use table layout for reliable email-client rendering.
                       Table acts like the previous flex layout but keeps correct
                       stacking in clients that don't support flexbox. */
                    .item-card {
                      width: 100%;
                      background: #f8fafc;
                      padding: 0;
                      border-radius: 8px;
                      margin: 14px 0 22px 0;
                      border-collapse: collapse;
                    }
                    .item-card td {
                      padding: 14px;
                      vertical-align: top;
                    }
                     .item-image {
                      width: 120px;
                      height: 90px;
                      border-radius: 8px;
                      overflow: hidden;
                      background: linear-gradient(135deg,#eef2ff,#f1f5f9);
                      color:#64748b;
                      font-size: 13px;
                      text-align: center;
                      padding: 6px;
                     }
                     .item-image img {
                      display: block;
                      width: 100%;
                      height: 100%;
                      object-fit: cover;
                     }
                     .item-info {
                      min-width: 0;
                     }
                     .item-info h4 {
                       margin: 0 0 6px 0;
                       font-size: 13px;
                       color: #0f172a;
                     }
                     .item-info p {
                       margin: 0 0 8px 0;
                       font-size: 14px;
                       color: #334155;
                       word-wrap: break-word;
                     }
                     .meta {
                       display: grid;
                       grid-template-columns: 110px 1fr;
                       gap: 6px 12px;
                       align-items: start;
                       margin-top: 6px;
                     }
                     .meta .label {
                       font-size: 13px;
                       color: #64748b;
                     }
                     .meta .value {
                       font-size: 14px;
                       color: #0f172a;
                       word-wrap: break-word;
                     }
                     .code-box {
                       text-align: center;
                       margin: 22px 0;
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
                     .note {
                       font-size: 13px;
                       color: #475569;
                       margin-top: 12px;
                     }
                     .footer {
                       font-size: 13px;
                       color: #94a3b8;
                       text-align: center;
                       padding: 18px;
                       border-top: 1px solid #eef2f7;
                     }
                     @media (max-width:520px){
                      /* Stack cells on small screens */
                      .item-card td { display:block; width:100% !important; box-sizing:border-box; }
                      .item-image { width:100% !important; height:160px !important; }
                      .meta { grid-template-columns: 1fr; }
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
                       <p>Thank you for using <strong>FindIt</strong>! Below is the verification code for the item you registered.</p>
 
                       <div class="code-box">
                         <div class="code">${code}</div>
                       </div>
 
                       <p style="margin-top:0;font-weight:600;">Item details</p>
 
                       <!-- Use a table for the item card so email clients that don't support flexbox
                            will render image and metadata in the intended order/stacking. -->
                       <table class="item-card" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                         <tr>
                           <td class="item-image" width="120" style="padding:14px;">
                             ${typeof photoUrl === 'string' && photoUrl.trim() ? `<img src="${photoUrl}" alt="Item photo" style="display:block; width:100%; height:100%; object-fit:cover; border-radius:6px;" />` : '<div style="padding:8px; text-align:center; color:#64748b;">No image available</div>'}
                           </td>
                           <td class="item-info" style="padding:14px;">
                             ${itemDescription ? `<h4 style="margin:0 0 6px 0; font-size:13px; color:#0f172a;">Description</h4><p style="margin:0 0 8px 0; font-size:14px; color:#334155;">${String(itemDescription)}</p>` : ''}
                             <div class="meta" style="display:grid; grid-template-columns:110px 1fr; gap:6px 12px; margin-top:6px;">
                               ${location ? `<div class="label" style="font-size:13px; color:#64748b;">Location</div><div class="value" style="font-size:14px; color:#0f172a;">${String(location)}</div>` : ''}
                               ${postedAt ? `<div class="label" style="font-size:13px; color:#64748b;">Posted</div><div class="value" style="font-size:14px; color:#0f172a;">${isNaN(Date.parse(postedAt)) ? String(postedAt) : new Date(postedAt).toLocaleString()}</div>` : ''}
                               ${contact ? `<div class="label" style="font-size:13px; color:#64748b;">Contact</div><div class="value" style="font-size:14px; color:#0f172a;">${String(contact)}</div>` : ''}
                             </div>
                           </td>
                         </tr>
                       </table>
 
                       <h3 style="margin-top:0;font-weight:600;">Keep this code safe—you’ll need it later, when your item is found!</h3>
 
                       <p class="note">This code is used to verify the user who has found your item. If someone finds your lost item, they will contact you. After you confirm that the item is indeed with them, you can share this code. The finder will then use it to update the item's status from "Not Found" to "Found".</p>
 
                       <p class="note">If you didn’t request this code, you can safely ignore this email.</p>
 
                       <p style="margin-top:18px;">Thanks,<br>— Avishek from FindIt</p>
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