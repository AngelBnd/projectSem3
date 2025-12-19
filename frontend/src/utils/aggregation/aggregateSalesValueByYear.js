export default function aggregateSalesValueByYear(sales) {
  const map = {};

  sales.forEach((order) => {
    const year = new Date(order.date).getFullYear();
    map[year] = (map[year] || 0) + parseFloat(order.totalAmount || 0);
  });

  const labels = Object.keys(map).sort();
  const data = labels.map((label) => map[label]);

  return { labels, data };
}
