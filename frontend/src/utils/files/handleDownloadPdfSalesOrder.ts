import jsPDF from "jspdf";
import "jspdf-autotable";
import type { SalesOrderSummary } from "../../types";

const handleExportPDFSalesOrder = (rows: SalesOrderSummary[]) => {
  const doc = new jsPDF();

  /* ======================
     CALCULATIONS
     ====================== */

  const collectedRevenue = rows.reduce((sum, row) => {
    if (row.paymentStatus?.toUpperCase() === "PAID") {
      return sum + Number(row.totalAmount ?? 0);
    }
    return sum;
  }, 0);

  const expectedRevenue = rows.reduce((sum, row) => {
    const status = row.paymentStatus?.toUpperCase();
    if (status === "UNPAID" || status === "PARTIALLY_PAID") {
      return sum + Number(row.totalAmount ?? 0);
    }
    return sum;
  }, 0);

  const totalRevenue = collectedRevenue + expectedRevenue;

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
  doc.text(`Created at: ${new Date().toLocaleDateString()}`, 14, 22);

  /* ======================
     SUMMARY
     ====================== */

  let y = 32;

  doc.setFontSize(11);
  doc.text("Summary", 14, y);

  y += 8;
  doc.setFontSize(10);
  doc.text(`Total Orders: ${rows.length}`, 14, y);

  y += 6;
  doc.text(
    `Collected Revenue: Rp ${collectedRevenue.toLocaleString("id-ID")}`,
    14,
    y
  );

  y += 6;
  doc.text(
    `Expected Revenue: Rp ${expectedRevenue.toLocaleString("id-ID")}`,
    14,
    y
  );

  y += 6;
  doc.text(
    `Total Revenue (Gross): Rp ${totalRevenue.toLocaleString("id-ID")}`,
    14,
    y
  );

  /* ======================
     STATUS BLOCKS
     ====================== */

  y += 10;

  doc.setFontSize(10);
  doc.text("Delivery Status", 14, y);
  doc.text("Payment Status", 110, y);

  y += 6;
  doc.text(`• Delivered: ${deliverySummary.DELIVERED}`, 18, y);
  doc.text(`• Paid: ${paymentSummary.PAID}`, 114, y);

  y += 6;
  doc.text(
    `• Partially Delivered: ${deliverySummary.PARTIALLY_DELIVERED}`,
    18,
    y
  );
  doc.text(`• Partially Paid: ${paymentSummary.PARTIALLY_PAID}`, 114, y);

  y += 6;
  doc.text(`• Undelivered: ${deliverySummary.UNDELIVERED}`, 18, y);
  doc.text(`• Unpaid: ${paymentSummary.UNPAID}`, 114, y);

  /* ======================
     TABLE
     ====================== */

  doc.autoTable({
    startY: y + 10,
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
      fillColor: [230, 230, 230],
      textColor: 0,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save("sales-orders-report.pdf");
};

export default handleExportPDFSalesOrder;
