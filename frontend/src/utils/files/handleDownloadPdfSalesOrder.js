import jsPDF from "jspdf";
import "jspdf-autotable";

const handleExportPDFSalesOrder = (rows) => {
  console.log("test ini punya handle export");
  console.log(rows);

  const doc = new jsPDF();

  /* ======================
     CALCULATIONS (HERE)
     ====================== */

  const totalSales = rows.reduce(
    (sum, row) => sum + Number(row.totalAmount ?? 0),
    0
  );

  const deliverySummary = {
    DELIVERED: rows.filter(
      (r) => r.deliveryStatus?.toUpperCase() === "DELIVERED"
    ).length,
    PARTIALLY_DELIVERED: rows.filter(
      (r) => r.deliveryStatus?.toUpperCase() === "PARTIALLY_DELIVERED"
    ).length,
    UNDELIVERED: rows.filter(
      (r) => r.deliveryStatus?.toUpperCase() === "UNDELIVERED"
    ).length,
  };

  const paymentSummary = {
    PAID: rows.filter((r) => r.paymentStatus?.toUpperCase() === "PAID").length,
    PARTIALLY_PAID: rows.filter(
      (r) => r.paymentStatus?.toUpperCase() === "PARTIALLY_PAID"
    ).length,
    UNPAID: rows.filter((r) => r.paymentStatus?.toUpperCase() === "UNPAID")
      .length,
  };

  /* ======================
     HEADER
     ====================== */

  doc.setFontSize(16);
  doc.text("Sales Orders Report", 14, 15);

  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

  /* ======================
     SUMMARY SECTION
     ====================== */

  doc.setFontSize(11);
  doc.text("Summary", 14, 32);

  doc.setFontSize(10);
  doc.text(`Total Orders: ${rows.length}`, 14, 40);
  doc.text(`Total Sales: Rp ${totalSales.toLocaleString("id-ID")}`, 14, 46);

  doc.text("Delivery Status:", 14, 56);
  doc.text(`• Delivered: ${deliverySummary.DELIVERED}`, 20, 62);
  doc.text(
    `• Partially Delivered: ${deliverySummary.PARTIALLY_DELIVERED}`,
    20,
    68
  );
  doc.text(`• Undelivered: ${deliverySummary.UNDELIVERED}`, 20, 74);

  doc.text("Payment Status:", 110, 56);
  doc.text(`• Paid: ${paymentSummary.PAID}`, 116, 62);
  doc.text(`• Partially Paid: ${paymentSummary.PARTIALLY_PAID}`, 116, 68);
  doc.text(`• Unpaid: ${paymentSummary.UNPAID}`, 116, 74);

  /* ======================
     TABLE
     ====================== */

  doc.autoTable({
    startY: 85,
    head: [
      [
        "Order ID",
        "Customer",
        "Date",
        "Total",
        "Channel",
        "Sub Channel",
        "Delivery",
        "Payment",
      ],
    ],
    body: rows.map((row) => [
      row.id,
      row.customer,
      row.date,
      `Rp ${Number(row.totalAmount ?? 0).toLocaleString("id-ID")}`,
      row.channel,
      row.subChannel,
      row.deliveryStatus,
      row.paymentStatus,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [230, 230, 230], // light grey
      textColor: 0,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245], // zebra rows
    },
  });

  doc.save("sales-orders-report.pdf");
};

export default handleExportPDFSalesOrder;
