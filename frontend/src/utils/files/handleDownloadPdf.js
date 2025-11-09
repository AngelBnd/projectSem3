import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

const handleDownloadPdf = (
  invoiceData,
  products,
  useDiscount,
  discountValue,
  formatCurrency,
  subtotal,
  discountAmount,
  total
) => {
    const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14; // consistent left/right margin for all content

    // === HEADER ===
    doc.setFontSize(18);
    doc.setTextColor(0);

    // Left: Invoice title
    doc.text(`Invoice #${invoiceData.invoiceId || "N/A"}`, marginX, 20);

    // Header separator line (aligned to text margin)
    doc.setDrawColor(180);
    doc.line(marginX, 25, pageWidth - marginX, 25);

    // Company name below line
    const companyName = "King-Motor";
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, marginX, 33);
    doc.setFont("helvetica", "normal");

    // Business Info
    doc.setFontSize(10);
    doc.setTextColor(100);
    const addressY = 39;
    doc.text(
    "Ruko Pd. Lestari, Jl. HOS Cokroaminoto No.19 blok a1, Karang Tengah, Ciledug, Tangerang Kota, Banten 15157",
    marginX,
    addressY,
    { maxWidth: pageWidth - marginX * 2 }
    );
    doc.setDrawColor(200);
    doc.line(marginX, addressY + 5, pageWidth - marginX, addressY + 5);

    // === CUSTOMER + INVOICE INFO ===
    const startY = 52;
    doc.setFontSize(12);
    doc.setTextColor(0);

    doc.text("Invoice Date:", marginX, startY);
    doc.text(
    invoiceData.invoiceDate
        ? new Date(invoiceData.invoiceDate).toLocaleDateString("en-GB")
        : "DD/MM/YYYY",
    60,
    startY
    );

    doc.text("Billed To:", marginX, startY + 8);
    doc.text(invoiceData.name || "Customer's Name", 60, startY + 8);

    doc.text("Subject:", marginX, startY + 16);
    doc.text(invoiceData.subject || "Enter Subject", 60, startY + 16);

    doc.text("Payment Method:", marginX, startY + 24);
    doc.text(invoiceData.paymentMethod || "Enter PaymentMethod", 60, startY + 24);

    // Line below payment info (aligned to text)
    const lineBelowPaymentY = startY + 30;
    doc.setDrawColor(200);
    doc.line(marginX, lineBelowPaymentY, pageWidth - marginX, lineBelowPaymentY);

    // === PRODUCTS TABLE ===
    const tableColumn = ["Product", "QTY", "Unit Price (Rp)", "Amount (Rp)"];
    const tableRows = products.map((product) => [
    product.productName || "N/A",
    product.quantitySold || 0,
    formatCurrency(product.sellingPrice || 0),
    formatCurrency((product.quantitySold || 0) * (product.sellingPrice || 0)),
    ]);

    doc.autoTable({
    startY: lineBelowPaymentY + 10,
    head: [tableColumn],
    body: tableRows,
    theme: "striped",
    headStyles: {
        fillColor: [230, 230, 230],
        textColor: 20,
        lineWidth: 0.1,
    },
    bodyStyles: { textColor: 50 },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    styles: {
        fontSize: 10,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
    },
    margin: { left: marginX, right: marginX }, // ensures alignment
    });

    // === TOTAL SECTION ===
    const finalY = doc.lastAutoTable.finalY + 10;
    const totalXStart = pageWidth - 70; // closer to table’s right edge

    doc.setFontSize(12);
    doc.text("Subtotal:", totalXStart, finalY);
    doc.text(`Rp ${formatCurrency(subtotal)}`, pageWidth - marginX, finalY, { align: "right" });

    if (useDiscount) {
    doc.text(`Discount (${discountValue}%)`, totalXStart, finalY + 8);
    doc.text(`Rp ${formatCurrency(discountAmount)}`, pageWidth - marginX, finalY + 8, {
        align: "right",
    });
    }

    // Line before total
    const lineY = finalY + 14;
    doc.setDrawColor(180);
    doc.line(totalXStart, lineY, pageWidth - marginX, lineY);

    // Bold Total
    doc.setFont("helvetica", "bold");
    doc.text("Total:", totalXStart, lineY + 8);
    doc.text(`Rp ${formatCurrency(total)}`, pageWidth - marginX, lineY + 8, { align: "right" });
    doc.setFont("helvetica", "normal");

    // === FOOTER ===
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
    "Thank you for your purchase!",
    marginX,
    doc.internal.pageSize.getHeight() - 10
    );

    // Auto open print dialog
    doc.autoPrint();
    const blobUrl = URL.createObjectURL(doc.output("blob"));
    window.open(blobUrl, "_blank");
};

export default handleDownloadPdf;
