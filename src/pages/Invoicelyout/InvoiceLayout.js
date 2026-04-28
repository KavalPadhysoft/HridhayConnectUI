import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./InvoiceLayout.css";
import logo from "../../assets/images/ChamperOfimg/AM-Logo-012-scaled.png";
import { INVOICE_LAYOUT_API_URL } from "helpers/api_helper";

const ITEMS_PER_PAGE = 5;
const CHARS_PER_LINE = 35;
const MAX_LINES_PER_PAGE = 13;

const estimateLines = (text) => {
  if (!text) return 1;
  const lines = Math.ceil(text.length / CHARS_PER_LINE);
  return Math.max(1, lines);
};

const calculatePageLines = (pageItems) => {
  return pageItems.reduce((total, item) => total + estimateLines(item.description), 0);
};

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

    fetch(`${INVOICE_LAYOUT_API_URL}?id=${invoiceId}`)
      .then(res => res.json())
      .then(res => {
        if (res.isSuccess && res.data) {
          setItems(res.data.items || []);
          setCompany(res.data.company || null);
          setInvoice(res.data.invoice || null);
          setTerms(res.data.terms || []);
        } else {
          setError("No data found");
        }
      })
      .catch(() => setError("Failed to fetch"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  const total = items.reduce((sum, i) => sum + (i.amount || 0), 0);

  // 🔥 PAGINATION LOGIC
  const pages = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    pages.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  const getPageSubtotal = (pageIndex) => {
    let subtotal = 0;
    for (let i = 0; i <= pageIndex; i++) {
      pages[i].forEach(item => {
        subtotal += item.amount || 0;
      });
    }
    return subtotal;
  };

  if (loading) return <div className="invoice-container">Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div id="invoice-pdf" className="invoice-wrapper">
      {pages.map((pageItems, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;

        return (
          <div className="invoice-box invoice-page" key={pageIndex}>

            {/* HEADER */}
            <div className="header">
              <div className="company">
                <img src={logo} alt="logo" className="company-logo" />
                <div className="company-details">
                  <h3>{company?.companyname}</h3>
                  <p>{company?.address}</p>
                  <p>{company?.mobile}</p>
                  <p>{company?.email}</p>
                </div>
              </div>

              <div className="invoice-title">
                <h2>TAX INVOICE</h2>
                <div>
                  <div><b>Invoice No:</b> {invoice?.invoiceNumber}</div>
                  <div><b>Date:</b> {invoice?.createdDate?.substring(0,10)}</div>
                </div>
              </div>
            </div>

            {/* BILL TO - only on first page */}
            {pageIndex === 0 && (
              <div className="bill-to">
                <strong>{invoice?.clientName}</strong><br />
                {invoice?.address}<br />
                {invoice?.city}, {invoice?.state} - {invoice?.pincode}
              </div>
            )}

            {/* TABLE */}
            <table className="table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Particulars</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>

              <tbody>
                {pageItems.map((item, index) => {
                  const lineCount = estimateLines(item.description);
                  return (
                    <tr key={index}>
                      <td>{pageIndex * ITEMS_PER_PAGE + index + 1}</td>
                      <td style={{ whiteSpace: "pre-wrap", verticalAlign: "top" }}>{item.description}</td>
                      <td style={{ verticalAlign: lineCount > 1 ? "top" : "middle" }}>{item.amount?.toLocaleString("en-IN")}</td>
                    </tr>
                  );
                })}

                {(() => {
                  const usedLines = calculatePageLines(pageItems);
                  const remainingLines = Math.max(0, MAX_LINES_PER_PAGE - usedLines);
                  const emptyRowsNeeded = Math.max(0, remainingLines - 1);

                  return [...Array(emptyRowsNeeded)].map((_, i) => (
                    <tr key={`empty-${i}`} style={{ height: "28px" }}>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ));
                })()}

                {/* SHOW SUBTOTAL ON ALL PAGES, FINAL TOTAL ON LAST PAGE */}
                <tr className="total-row">
                  <td colSpan="2" className="total-label">
                    {isLastPage ? "Total" : `Sub Total (Page ${pageIndex + 1})`}
                  </td>
                  <td className="total-value">
                    ₹{getPageSubtotal(pageIndex).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* FOOTER - all pages */}
            <div className="payment-signature-row">
              <div className="payment-box">
                <div>
                  <b>Payment Details</b>
                  <ul>
                    <li>A/c No: {company?.accountNo}</li>
                    <li>Bank: {company?.bank}</li>
                    <li>IFSC: {company?.ifscCode}</li>
                  </ul>
                </div>
              </div>

              <div className="signature-right">
                {company?.signData && (
                  <img
                    src={`data:${company.signContentType};base64,${company.signData}`}
                    alt="sign"
                    className="sign-img"
                  />
                )}
                <p>Authorized Signatory</p>
              </div>
            </div>

            {/* TERMS - all pages */}
            <div className="terms-full">
              <h4>Terms & Conditions</h4>
              {terms.map((t, i) => (
                <div key={i} className="term-item">
                  {i + 1}. {t.terms}
                </div>
              ))}
            </div>

            <div className="thank-you">
              Thank you for your business!
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default InvoiceLayout;