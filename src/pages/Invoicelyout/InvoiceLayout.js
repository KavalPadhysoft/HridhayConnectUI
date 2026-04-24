
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./InvoiceLayout.css";
import logo from "../../assets/images/ChamperOfimg/AM-Logo-012-scaled.png";
import { INVOICE_LAYOUT_API_URL } from "helpers/api_helper";





const InvoiceLayout = () => {
  const [items, setItems] = useState([]);
  const [company, setCompany] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { id: invoiceId } = useParams();
  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    fetch(`${INVOICE_LAYOUT_API_URL}?id=${invoiceId}`)
      .then(res => res.json())
      .then(res => {
        if (res.isSuccess && res.data) {
          setItems(Array.isArray(res.data.items) ? res.data.items : []);
          setCompany(res.data.company || null);
          setInvoice(res.data.invoice || null);
          setTerms(Array.isArray(res.data.terms) ? res.data.terms : []);
        } else {
          setError(res.message || "No data found");
        }
      })
      .catch(() => setError("Failed to fetch invoice data"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const total = items.reduce((sum, i) => sum + (i.amount || 0), 0);
  console.log(total);

  if (loading) return <div className="invoice-container"><div>Loading...</div></div>;
  if (error) return <div className="invoice-container"><div style={{color:'red'}}>{error}</div></div>;

  return (
  //  <div className="invoice-wrapper invoice-page">
  <div id="invoice-pdf" className="invoice-wrapper invoice-page">
      <div className="invoice-box">
        {/* HEADER */}
        <div className="header">
          <div className="company">
            <img src={logo} alt="logo" className="company-logo" />
            <div className="company-details">
              <h3>{company?.companyname || "Chambers Of AM"}</h3>
              <p>{company?.address || "Ahmedabad, Gujarat"}</p>
              <p>{company?.mobile || "+91-XXXXXXXXXX"}</p>
              <p>{company?.email || "info@padhyasoft.com"}</p>
            </div>
          </div>
          <div className="invoice-title">
            <h2>TAX INVOICE</h2>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              <div><b>Invoice No:</b> {invoice?.invoiceNumber || "PST2026-27/001"}</div>
              <div><b>Invoice Date:</b> {invoice?.createdDate?.substring(0, 10) || "22/04/2026"}</div>
            </div>
          </div>
        </div>

        {/* BILL TO */}
        <div className="bill-to">
          <div className="bill-to-label">Bill To:</div>
          <div className="bill-to-details">
            <strong>{invoice?.clientName || "N/A"}</strong><br />
           {invoice?.address && (
      <>
        <br />
        {invoice.address}
      </>
    )}
            {invoice?.city}, {invoice?.state}, {invoice?.pincode}<br />
          </div>
        </div>

        {/* TABLE */}
     <table className={`table ${items.length === 1 ? "single-row" : ""}`}>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Particulars</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
 <tbody>
  {/* ACTUAL ITEMS */}
  {items.map((item, index) => (
    <tr key={item.itemId}>
      <td>{index + 1}</td>

      <td>{item.description}</td>

      <td>{item.amount?.toLocaleString("en-IN")}</td>
    </tr>
  ))}

  {/* 🔥 EMPTY ROWS LOGIC */}
{/* 🔥 SINGLE EMPTY SPACE ROW */}
{items.length < 4 && (
  <tr className="empty-space-row">
    <td></td>
    <td></td>
    <td></td>
  </tr>
)}

  {/* TOTAL */}
<tr className="total-row">
  <td colSpan="2" className="total-label">
    Total Amount
  </td>
  <td className="total-value">
    ₹{invoice?.finalAmount?.toLocaleString("en-IN")}/-
  </td>
</tr>
</tbody>
        </table>

        {/* PAYMENT DETAILS */}
<div className="payment-signature-row">

  {/* LEFT → PAYMENT */}
  <div className="payment-box">
    <div className="payment-icon">🏦</div>

    <div className="payment-content">
      <div className="payment-title">Payment Details</div>

      <ul>
        <li><b>A/c No:</b> {company?.accountNo}</li>
        <li><b>A/c Name:</b> {company?.accountName}</li>
        <li><b>Bank:</b> {company?.bank}</li>
        <li><b>IFSC:</b> {company?.ifscCode}</li>
        <li><b>PAN:</b> {company?.pan}</li>
      </ul>
    </div>
  </div>

  {/* RIGHT → SIGNATURE */}
  <div className="signature-right">
    <div className="signature-box">

      {company?.signData && company.signData.startsWith("iVBOR") ? (
        <img
          src={`data:${company.signContentType};base64,${company.signData}`}
          alt="signature"
          className="sign-img"
        />
      ) : (
        <div className="sign-placeholder">Sign</div>
      )}

      <p className="sign-title">Authorized Signatory</p>
      <p>Aditya Mahadevia</p>
    </div>
  </div>

</div>


<div className="terms-full">

  <h4>Terms & Conditions</h4>

  {terms && terms.length > 0 ? (
    [...terms]
      .sort((a, b) => (a.displaySeqNo || 0) - (b.displaySeqNo || 0))
      .map((term, index) => (
        <div key={term.id} className="term-item">
          <span className="term-number">{index + 1}.</span>
          <span className="term-text">{term.terms}</span>
        </div>
      ))
  ) : (
    <p>No terms available</p>
  )}

</div>


<div className="thank-you">
  <span>Thank you for your business!</span>
</div>
      </div>
    </div>
  );
};

export default InvoiceLayout;