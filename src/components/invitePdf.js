export const invitePdf = ({ EVENT_INFO, form, children, auth }) => {
  const dobFormatted = form.dob
    ? new Date(form.dob).toLocaleDateString('en-GB')
    : '-';
  const html = `
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Event Registration</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
  <style>
    /* Reset & base */
    body {
      font-family: 'Roboto', Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 24px;
      background: #f9f9f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      max-width: 700px;
      margin: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      padding: 24px 32px;
    }
    .header {
      text-align: center;
      background-color: #002b5c;
      color: #fff;
      padding: 20px 16px;
      border-radius: 12px 12px 0 0;
      box-shadow: inset 0 -3px 8px rgba(0,0,0,0.2);
    }
    .header h2 {
      margin: 0 0 6px 0;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: 1px;
    }
    .header .subtitle {
      font-weight: 700;
      font-size: 16px;
      opacity: 0.85;
    }
    .section {
      margin-top: 24px;
      padding: 18px 24px;
      border: 1px solid #d1d7e0;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .label {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 8px;
      color: #002b5c;
      border-bottom: 2px solid #002b5c;
      padding-bottom: 4px;
    }
    .field {
      font-size: 15px;
      margin-bottom: 8px;
      line-height: 1.4;
      color: #444;
    }
    .small {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
      font-style: italic;
    }
    ul.children-list {
      padding-left: 20px;
      margin-top: 6px;
      color: #444;
      list-style-type: disc;
    }
    ul.children-list li {
      margin-bottom: 4px;
    }
    .footer-note {
      margin-top: 24px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      color: #002b5c;
      letter-spacing: 0.5px;
    }
    .bottom-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #666;
      font-style: italic;
      border-top: 1px solid #ddd;
      padding-top: 16px;
      letter-spacing: 0.3px;
    }
    .bottom-footer a {
      color: #002b5c;
      text-decoration: none;
      font-weight: 600;
    }
    .bottom-footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${EVENT_INFO.titleBig}</h2>
      <div class="subtitle">${EVENT_INFO.subtitle}</div>
    </div>

    <div class="section">
      <div class="label">Registration ID</div>
      <div class="field">${auth?.user}</div>
      <div class="small">Registered at: ${new Date(
        form?.createdAt,
      ).toLocaleString()}</div>
    </div>

    <div class="section">
      <div class="label">Participant Information</div>
      <div class="field"><strong>Name:</strong> ${form?.fullName}</div>
      <div class="field"><strong>DOB:</strong> ${dobFormatted}</div>
      <div class="field"><strong>Mobile:</strong> ${form?.mobile}</div>
      <div class="field"><strong>Village/City:</strong> ${form?.village}</div>
      <div class="field"><strong>Attending:</strong> ${
        form?.attending ? 'Yes' : 'No'
      }</div>
      <div class="field"><strong>Children:</strong> ${
        form?.children?.length
      }</div>
      ${
        form?.children?.length > 0
          ? `<div class="field"><strong>Children details:</strong>
            <ul class="children-list">` +
            children.map(c => `<li>${c.name} (age ${c.age})</li>`).join('') +
            `</ul></div>`
          : ''
      }
      <div class="field"><strong>Comments:</strong> ${
        form?.comments || '-'
      }</div>
    </div>

    <div class="section">
      <div class="label">Event Details</div>
      <div class="field">${EVENT_INFO.dateLine}</div>
      <div class="field">${EVENT_INFO.timeLine}</div>
      <div class="field">${EVENT_INFO.placeLine}</div>
      <div class="footer-note">Let's reconnect, relive memories, and celebrate our school bond!</div>
    </div>

    <div class="bottom-footer">
      <p>Thank you for registering! See you soon at the event.</p>
     <p>Visit us: 
  <a href="#" onclick="event.preventDefault();" style="color:#002b5c; text-decoration:none; cursor:default;">
    https://www.jamod.in
  </a>
</p>
    </div>
  </div>
</body>
</html>
`;

  return html;
};