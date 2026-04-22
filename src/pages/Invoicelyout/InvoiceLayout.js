
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./InvoiceLayout.css";
import logo from "../../assets/images/ChamperOfimg/AM-Logo-012-scaled.png";




const API_URL = "https://localhost:7281/api/Invoice/GetInvoicesLayoutdata";


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
    fetch(`${API_URL}?id=${invoiceId}`)
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
          <b>Bill To:</b><br />
          Client Name - {invoice?.clientName}<br />
          Address - {invoice?.address}<br />
          City - {invoice?.city}, State - {invoice?.state}
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
  <tr>
    <td colSpan="2" style={{ textAlign: "right", fontWeight: "bold" }}>
      Total Amount
    </td>
    <td style={{ fontWeight: "bold", textAlign: "right" }}>
      ₹{invoice?.finalAmount?.toLocaleString("en-IN")}/-
    </td>
  </tr>
</tbody>
        </table>

        {/* PAYMENT DETAILS */}
<div className="payment-box">
  
  {/* ICON */}
  <div className="payment-icon">🏦</div>

  {/* CONTENT */}
  <div className="payment-content">
    <div className="payment-title">Payment Details</div>

    <ul>

      {/* OPTIONAL EXTRA */}
      <li><b>A/c No:</b> {company?.accountNo}</li>
      <li><b>A/c Name:</b> {company?.accountName}</li>
      <li><b>Bank:</b> {company?.bank}</li>
      <li><b>IFSC:</b> {company?.ifscCode}</li>
      <li><b>PAN:</b> {company?.pan}</li>
    </ul>
  </div>

</div>

        {/* TERMS & SIGNATURE */}
        <div className="terms-signature">
          <div className="terms-left">
            <h4>Terms & Conditions</h4>
            <ol>
  {terms && terms.length > 0 ? (
    [...terms]   // copy array
      .sort((a, b) => (a.displaySeqNo || 0) - (b.displaySeqNo || 0))
      .map((term) => (
        <li key={term.id}>
          {term.terms}
        </li>
      ))
  ) : (
    <li>No terms available</li>
  )}
</ol>
          </div>
  <div className="signature-right">
  <div className="signature-box">


    {/* SIGNATURE IMAGE OR FALLBACK */}
    {company?.signData && company.signData.startsWith("iVBOR") ? (
      <img
        src={`data:${company.signContentType};base64,${company.signData}`}
        alt="signature"
        className="sign-img"
      />
    ) : (
      <div
        style={{
          margin: '10px auto',
          fontWeight: 'bold',
          fontSize: 16,
          background: '#222',
          color: '#fff',
          width: 80,
          textAlign: 'center',
          borderRadius: 3,
          padding: '5px 0'
        }}
      >
        Sign
      </div>
    )}

    {/* TEXT */}
    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold' }}>
      Authorized Signatory
    </p>

    <p style={{ margin: 0 }}>
      Aditya Mahadevia
    </p>

  </div>
</div>
        </div>


<div className="thank-you">
  <span>Thank you for your business!</span>
</div>
      </div>
    </div>
  );
};

export default InvoiceLayout;