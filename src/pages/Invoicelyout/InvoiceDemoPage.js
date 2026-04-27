import React, { useEffect, useRef } from "react";
import InvoiceLayout from "./InvoiceLayout";
import html2pdf from "html2pdf.js";

const InvoiceDemoPage = () => {
  const loadingRef = useRef(true);

  useEffect(() => {
    const checkLoaded = setInterval(() => {
      const invoiceBox = document.querySelector(".invoice-box");
      if (invoiceBox) {
        const hasData = invoiceBox.querySelector("table tbody tr");
        if (hasData && hasData.textContent.trim()) {
          clearInterval(checkLoaded);
          setTimeout(() => generatePDF(), 100);
        }
      }
    }, 100);

    return () => clearInterval(checkLoaded);
  }, []);

  const generatePDF = () => {
    const element = document.getElementById("invoice-pdf");
    if (!element) return;

    const opt = {
      margin: 5,
      filename: `invoice-${Date.now()}.pdf`,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div id="invoice-pdf">
      <InvoiceLayout />
    </div>
  );
};

export default InvoiceDemoPage;
