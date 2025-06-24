import {Alert, PermissionsAndroid} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFetchBlob from 'rn-fetch-blob';
import Colors from '../constants/Colors';

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const requestStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message:
          'This app needs access to storage to save receipts in the Download folder.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Storage permission granted');
      return true;
    } else {
      console.log('Storage permission denied');
      Alert.alert(
        'Permission Required',
        'Storage permission is needed to save receipts. Some features may not work.',
        [{text: 'OK'}],
      );
      return false;
    }
  } catch (err) {
    console.warn('Error requesting storage permission:', err);
    Alert.alert(
      'Error',
      'Failed to request storage permission. Please try again.',
    );
    return false;
  }
};

export const handleDownloadReceipt = async (order, company) => {
  try {
    const htmlContent = `
      <html>
        <head>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              font-size: 12px;
              margin: 0;
              padding: 10px;
              max-width: 800px;
              background-color: #f5f5f5;
              color: #333;
              line-height: 1.4;
            }
            .invoice-container {
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              padding: 20px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid ${Colors.neutral['900']};
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .header-title {
              font-size: 22px;
              font-weight: bold;
              color: ${Colors.text['primary']};
              margin: 0;
              text-transform: uppercase;
            }
            .header-subtitle {
              font-size: 11px;
              color: #666;
              margin: 4px 0;
            }
            .company-details {
              font-size: 11px;
              color: #555;
              text-align: center;
              margin-bottom: 8px;
              line-height: 1.5;
            }
            .section {
              margin-bottom: 12px;
              padding: 12px;
              background-color: #fafafa;
              border-radius: 6px;
              border: 1px solid #e5e5e5;
            }
            .section-title {
              font-size: 14px;
              font-weight: 600;
              color: #333;
              margin-bottom: 8px;
              border-left: 3px solid ${Colors.neutral['900']};
              padding-left: 6px;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 11px;
            }
            .label {
              font-weight: 500;
              color: #555;
              width: 40%;
            }
            .value {
              font-weight: 400;
              color: #333;
              text-align: right;
              width: 60%;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 6px;
              font-size: 11px;
            }
            .table th, .table td {
              border: 1px solid #e0e0e0;
              padding: 6px;
              text-align: left;
            }
            .table th {
              background-color: ${Colors.neutral['900']};
              color: #fff;
              font-weight: 600;
              font-size: 12px;
            }
            .table td {
              background-color: #fff;
            }
            .table tr:nth-child(even) td {
              background-color: #f9f9f9;
            }
            .total-row {
              font-weight: bold;
              font-size: 12px;
            }
            .footer {
              text-align: left;
              margin-top: 12px;
              padding-top: 12px;
              border-top: 1px solid #e5e5e5;
              font-size: 10px;
              color: #666;
            }
            .footer-note {
              font-style: italic;
              margin-top: 8px;
              color: #888;
            }
            .payment-details .detail-row:last-child .value {
              font-weight: bold;
              color: ${Colors.neutral['900']};
              font-size: 13px;
            }
            @media print {
              .invoice-container {
                box-shadow: none;
                border: none;
              }
              body {
                padding: 0;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1 class="header-title">${company.company_name}</h1>
              <p class="header-subtitle">Invoice #${order.id.slice(0, 8)}</p>
              <div class="company-details">
                <p>${company.address}</p>
                <p>GSTIN: ${company.gst_number}</p>
                <p>Email: ${company.contact_information.email} | Phone: ${
      company.contact_information.phone
    }</p>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Order Details</h2>
              <div class="detail-row">
                <span class="label">Order ID:</span>
                <span class="value">#${order.id.slice(0, 13)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${order.date}</span>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Customer Details</h2>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span class="value">${order.customer.firstName} ${
      order.customer.lastName
    }</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span class="value">${order.customer.email}</span>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Shipping Address</h2>
              <div class="detail-row">
                <span class="value">
                  ${order.customer.firstName} ${order.customer.lastName}<br />
                  ${order.shippingAddress.street}<br />
                  ${order.shippingAddress.city}, ${
      order.shippingAddress.state
    } ${order.shippingAddress.zip}<br />
                  ${order.shippingAddress.country}
                </span>
              </div>
            </div>

            <div class="section">
              <h2 class="section-title">Order Items</h2>
              <table class="table">
                <tr>
                  <th style="width: 40%;">Item</th>
                  <th style="width: 20%; text-align: right;">Price</th>
                  <th style="width: 20%; text-align: right;">Qty</th>
                  <th style="width: 20%; text-align: right;">Total</th>
                </tr>
                ${order.items
                  .map(
                    item => `
                    <tr>
                      <td>${item.name}</td>
                      <td style="text-align: right;">$${item.price.toFixed(
                        2,
                      )}</td>
                      <td style="text-align: right;">${item.quantity}</td>
                      <td style="text-align: right;">$${(
                        item.price * item.quantity
                      ).toFixed(2)}</td>
                    </tr>
                  `,
                  )
                  .join('')}
              </table>
            </div>

            <div class="section payment-details">
              <h2 class="section-title">Payment Details</h2>
              <div class="detail-row">
                <span class="label">Subtotal:</span>
                <span class="value">$${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="label">Tax:</span>
                <span class="value">$${order.tax.toFixed(2)}</span>
              </div>
              <div class="detail-row total-row">
                <span class="label">Total:</span>
                <span class="value">$${order.total.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for shopping with ${company.company_name}!</p>
              <p class="footer-note">For inquiries, contact us at ${
                company.contact_information.email
              } or ${company.contact_information.phone}</p>
              <p class="footer-note">${
                company.company_name
              } © ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const options = {
      html: htmlContent,
      fileName: `order_${order.id.slice(0, 8)}_receipt`,
      directory: RNFetchBlob.fs.dirs.DownloadDir,
    };

    const file = await RNHTMLtoPDF.convert(options);
    Alert.alert('Success', `Receipt saved to: ${file.filePath}`);
  } catch (error) {
    console.error('Error generating receipt:', error);
    Alert.alert('Error', 'Failed to generate receipt. Please try again.');
  }
};
