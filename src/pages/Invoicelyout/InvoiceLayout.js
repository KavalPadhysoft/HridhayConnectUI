
// import React from "react";
// import "./InvoiceLayout.css";
// import logo from "../../assets/images/ChamperOfimg/AM-Logo-012-scaled.png";
// import signature from "../../assets/images/ChamperOfimg/SineDemo.jpeg";

// const invoiceItems = [
//   { sr: 1, description: "Professional Fees for Drafting and Filing Three Trademarks for IndusIQ in Classes 42, 35, and 9", amount: 60000 },
//   { sr: 2, description: "Trademark Consultation Charges", amount: 10000 },
//   { sr: 3, description: "Legal Documentation Fees", amount: 8000 },
//   { sr: 4, description: "Filing Charges", amount: 5000 },
//   { sr: 5, description: "Government Fees", amount: 7000 },
//   { sr: 6, description: "Miscellaneous Charges", amount: 3000 },
//   { sr: 7, description: "Review Charges", amount: 4000 },
//   { sr: 8, description: "Final Submission Fees", amount: 6000 }
// ];


// const InvoiceLayout = () => (
//   <div className="invoice">
//     {/* Header */}
//     <div className="invoice__header">
//       <img src={logo} alt="logo" className="invoice__logo" />
//       <h1>INVOICE</h1>
//     </div>
//     {/* Info */}
//     <div className="invoice__info">
//       <div>
//         <p><strong>Name:</strong> R WORLD LEISURE LIMITED</p>
//         <p><strong>Address:</strong> Plot No. 400, Sector-16, Gandhinagar, Gujarat - 382016</p>
//         <p><strong>Consult Person:</strong> Mr. Pradip Chudasama</p>
//       </div>
//       <div className="invoice__right">
//         <p><strong>Bill No:</strong> AM/103/2025</p>
//         <p><strong>Date:</strong> 09/04/2026</p>
//       </div>
//     </div>
//     {/* Table */}
//     <table className="invoice__table">
//       <thead>
//         <tr>
//           <th>SR</th>
//           <th>PARTICULARS</th>
//           <th>Fees (INR)</th>
//         </tr>
//       </thead>
//       <tbody>
//         {invoiceItems.map((item) => (
//           <tr key={item.sr}>
//             <td>{item.sr}</td>
//             <td>{item.description}</td>
//             <td>{item.amount.toLocaleString("en-IN")}.00</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//     {/* Total */}
//     <div className="invoice__total">
//       <span>Amount in Words: RUPEES SIXTY THOUSAND ONLY</span>
//       <h2>₹ 60,000.00</h2>
//     </div>
//     {/* Footer Section - Compact */}
//     <div className="invoice__footer" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'24px'}}>
//       <div className="invoice__bank" style={{flex:1}}>
//         <h4 style={{marginBottom:8}}>Bank Details</h4>
//         <div style={{fontSize:'15px',lineHeight:'1.5'}}>
//           <div>A/c No: 50100285437412</div>
//           <div>A/c Name: Aditya Mahadeviya</div>
//           <div>Bank: HDFC Bank Ltd.</div>
//           <div>IFSC: HDFC0009098</div>
//           <div>PAN: BYFPM6692A</div>
//         </div>
//       </div>
//       <div className="invoice__signature" style={{textAlign:'center',minWidth:120}}>
//         <img src={signature} alt="sign" style={{width:90,marginBottom:4}} />
//         <div style={{fontSize:'14px'}}>Aditya Mahadevia</div>
//       </div>
//     </div>
//     {/* Terms & Conditions - Compact */}
//     <div className="invoice__terms" style={{marginTop:20}}>
//       <h4 style={{marginBottom:8}}>Terms & Conditions</h4>
//       <ul style={{margin:0,paddingLeft:20,fontSize:'15px',lineHeight:'1.7'}}>
//         <li>Payment is due within 15 days from the date of invoice.</li>
//         <li>Interest @18% p.a. will be charged on delayed payments.</li>
//         <li>All disputes are subject to Ahmedabad jurisdiction only.</li>
//         <li>Fees once paid are non-refundable.</li>
//         <li>Government fees/taxes will be charged extra as applicable.</li>
//         <li>Work will commence only after receipt of advance payment.</li>
//         <li>All communication must be in writing via email.</li>
//       </ul>
//     </div>
//     {/* Bottom Contact */}
//     <div className="invoice__bottom">
//       <span>📞 +91 8141743337</span>
//       <span>✉️ chambers.am@outlook.com</span>
//       <span>📍 Ahmedabad - 380059</span>
//     </div>
//   </div>
// );


// export default InvoiceLayout;
//////////////////////////
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
    <div className="invoice-container">

      {/* watermark */}
      <div className="watermark"></div>

      {/* Header */}
      <div className="header">
        <img src={logo} className="logo" />
        <h1>INVOICE</h1>
      </div>

      {/* Info */}
      <div className="info">
        <div>
          <p><b>Name:</b> {company?.accountName || '-'}</p>
          <p><b>Address:</b> {company?.address || '-'}</p>
          <p><b>Consult Person:</b> {invoice?.clientName || '-'}</p>
        </div>

        <div className="right">
          <p><b>Bill No:</b> {invoice?.invoiceNumber || '-'}</p>
          <p><b>Date:</b> {invoice?.createdDate ? invoice.createdDate.substring(0, 10) : '-'}</p>
        </div>
      </div>

      {/* Table */}
      <table className="table">
        <thead>
          <tr>
            <th>Sr.</th>
            <th>Item Type</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? items.map((item, idx) => (
            <tr key={item.itemId || idx}>
              <td>{idx + 1}</td>
              <td>{item.itemType}</td>
              <td>{item.description}</td>
              <td>{item.amount?.toLocaleString("en-IN")}</td>
            </tr>
          )) : (
            <tr><td colSpan={4} style={{textAlign:'center'}}>No items</td></tr>
          )}
        </tbody>
      </table>

      {/* Total */}
      <div className="total-row">
        <span><b>Amount in Words:</b> RUPEES SIXTY THOUSAND ONLY</span>
        <h2>₹ {total.toLocaleString("en-IN")}.00</h2>
      </div>

      {/* Bank + Sign */}
      <div className="bottom-section">
        <div className="bank">
          <h4>Bank Details</h4>
          <p>A/c No: {company?.accountNo || '-'}</p>
          <p>A/c Name: {company?.accountName || '-'}</p>
          <p>Bank: {company?.bank || '-'}</p>
          <p>IFSC: {company?.ifscCode || '-'}</p>
          <p>PAN: {company?.pan || '-'}</p>
        </div>

        <div className="sign">
          {/* If signData is base64, render as image */}
          {company && company.signData && (
            <img src={`data:${company.signContentType};base64,${company.signData}`} alt="sign" style={{width:90,marginBottom:4}} />
          )}
          <p>{company?.accountName || "-"}</p>
        </div>
      </div>

      {/* Terms */}
      <div className="terms">
        <h4>Terms & Conditions</h4>
        <ul>
          {terms.length > 0
            ? terms
                .slice()
                .sort((a, b) => (a.displaySeqNo || 0) - (b.displaySeqNo || 0))
                .map((term, idx) => (
                  <li key={term.id}>
                    {term.terms}
                  </li>
                ))
            : <li>-</li>}
        </ul>
      </div>

      {/* Footer */}
<div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
  
  <span>📞 <span>+91 8141743337</span></span>
  <span>✉️ <span>chambers.am@outlook.com</span></span>
  <span>📍 <span>Ahmedabad - 380059</span></span>
</div>
    </div>
  );
};

export default InvoiceLayout;