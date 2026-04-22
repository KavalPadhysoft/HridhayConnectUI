// import React from "react";
// import InvoiceLayout from "./InvoiceLayout";

// const InvoiceDemoPage = () => {
//   return <InvoiceLayout />;
// };

// export default InvoiceDemoPage;
/// demo 101
// import React, { useEffect } from "react";
// import InvoiceLayout from "./InvoiceLayout";
// import html2pdf from "html2pdf.js";
// const downloadPDF = () => {
//   const element = document.getElementById("invoice-pdf");

//   if (!element) return;

//   const opt = {
//     margin: 5,
//     filename: `invoice-${Date.now()}.pdf`,
//     image: { type: "jpeg", quality: 1 },
//     html2canvas: { scale: 2 },
//     jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
//   };

//   html2pdf().set(opt).from(element).save();
// };

// const InvoiceDemoPage = () => {

//   useEffect(() => {
//     // wait for UI to render
//     setTimeout(() => {
//       const element = document.getElementById("invoice-pdf");

//       if (!element) return;

//       const opt = {
//         margin: 5,
//         filename: "invoice.pdf",
//         image: { type: "jpeg", quality: 1 },
//         html2canvas: { scale: 2 },
//         jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
//       };

//       html2pdf().set(opt).from(element).save();
//     }, 800); // wait for API data render
//   }, []);

//   return (
//     <div id="invoice-pdf">
//       <InvoiceLayout />
//     </div>
//   );
// };

// export default InvoiceDemoPage;

import React, { useEffect } from "react";
import InvoiceLayout from "./InvoiceLayout";
import html2pdf from "html2pdf.js";

const InvoiceDemoPage = () => {

  useEffect(() => {
    // wait for data + UI render
    setTimeout(() => {
      const element = document.getElementById("invoice-pdf");
      if (!element) return;

      const opt = {
        margin: 0,
        filename: "invoice.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      html2pdf()
        .set(opt)
        .from(element)
        .outputPdf("bloburl")
        .then((url) => {
          window.open(url, "_blank"); // 🔥 OPEN NEW TAB
        });

    }, 800); // wait for API render
  }, []);

  return (
    <div id="invoice-pdf">
      <InvoiceLayout />
    </div>
  );
};

export default InvoiceDemoPage;
