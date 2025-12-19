export default function aggregateSalesValueByWeekly(sales) {
  const map = {};

  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const label = d.toLocaleDateString("en-EN", { weekday: "short" });
    map[label] = 0;
  }

  sales.forEach((order) => {
    const orderDate = new Date(order.date);
    if (
      orderDate >= monday &&
      orderDate < new Date(monday.getTime() + 7 * 86400000)
    ) {
      const label = orderDate.toLocaleDateString("en-EN", { weekday: "short" });
      map[label] += parseFloat(order.totalAmount || 0);
    }
  });

  const labels = Object.keys(map);
  const data = labels.map((label) => map[label]);

  return { labels, data };
}
