export default function aggregateSalesValueByMonth(sales) {
  const map = {};

  sales.forEach((order) => {
    const date = new Date(order.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const key = `${year}-${month}`;
    map[key] = (map[key] || 0) + parseFloat(order.totalAmount || 0);
  });

  const sortedKeys = Object.keys(map).sort(
    (a, b) => new Date(a + "-01") - new Date(b + "-01")
  );
  const labels = sortedKeys.map((key) => {
    const [year, month] = key.split("-");
    const date = new Date(year, month);
    return date.toLocaleString("en-EN", { month: "short", year: "numeric" });
  });

  const data = sortedKeys.map((key) => map[key]);

  return { labels, data };
}
