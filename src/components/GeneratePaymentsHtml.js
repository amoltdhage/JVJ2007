import commaNumber from 'comma-number';

export const generatePaymentsHTML = (
  payments,
  totalAmount,
  type = 'payment',
) => {
  // Helper function for formatting date & time
  const formatDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = String(hours).padStart(2, '0');

    return `${day}/${month}/${year} at ${strHours}:${minutes}${ampm}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Payment Details</title>
<style>
  @page {
    background-color: #daecf9;
    margin: 15px;
  }
  body {
    font-family: Arial, sans-serif;
    background-color: #daecf9;
    margin: 0;
    padding: 20px;
    font-size: 14px;
    color: #333;
  }

  h1 {
    text-align: center;
    color: #040b51;
  }
 h2 {
    text-align: center;
    color: #040b51;
    margin-bottom: 25px;
    font-size: 18px;
  }

  .total-summary {
    display: flex;
    background-color: #f5f7fa;
    border: 1px solid #dcdcdc;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
  }

  .new-total-summary span {
    color: #1E90FF;
    font-weight: 600;
  }

  .new-total-summary {
    margin-left: 20px;
    font-weight: 600;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  th, td {
    padding: 10px 8px;
    text-align: center;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #040b51;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:nth-child(odd) {
    background-color: #ffffff;
  }

  td {
    font-size: 13px;
    color: #333;
  }

  .paid { color: #4caf50; font-weight: 600; }
  .pending { color: #e53935; font-weight: 600; }
  .received { color: #750581; font-weight: 600; }
  .not-received { color: #b0b0b0; font-weight: 600; }

  footer {
    text-align: center;
    margin-top: 25px;
    font-size: 12px;
    color: #666;
  }
</style>
</head>
<body>
  <h1>${type === 'expense' ? 'Expense' : 'Collection'} Details</h1>
  <h2>JVJ 2007 - 10th Batch Get Together - 2025</h2>
  <div class="total-summary">
    <div class="new-total-summary">Total Amount&nbsp;:&nbsp;<span>₹${commaNumber(
      totalAmount,
    )}</span></div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:10%;">Sr No.</th>
        <th style="width:35%;">${type === 'expense' ? 'Expense' : 'Payee'}</th>
        <th style="width:15%">Amount</th>
        <th style="width:15%">Status</th>
        ${type !== 'expense' ? `<th style="width:25%">Receipt Status</th>` : ''}
      </tr>
    </thead>
    <tbody>
      ${payments
        .map(
          (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item?.[type === 'expense' ? 'expense' : 'payee']}</td>
            <td class="${
              item.status === 'Paid' ? 'paid' : 'pending'
            }">₹${commaNumber(item.amount)}</td>
            <td class="${item.status === 'Paid' ? 'paid' : 'pending'}">${
            item.status
          }
          </td>
          ${
            type !== 'expense'
              ? `<td class="${
                  item.received === 'Received' ? 'received' : 'not-received'
                }">${item.received || 'Not Received'}</td>`
              : ''
          }
          </tr>
        `,
        )
        .join('')}
    </tbody>
  </table>
  <footer>Generated on ${formatDateTime()}</footer>
</body>
</html>
`;
};