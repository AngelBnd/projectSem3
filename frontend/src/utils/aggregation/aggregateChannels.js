/**
 * Aggregates total quantity sold per channel/subchannel using a lookup map.
 * @param {Array<Object>} rawSales - The array of sales objects.
 * @param {Object} channelMap - Map object: { channelId: channelName }
 * @param {Object} subChannelMap - Map object: { subChannelId: subChannelName }
 * @returns {{ labels: Array<string>, data: Array<number> }} - Chart-ready data.
 */
export function aggregateChannels(sales) {
  const map = {};

  sales.forEach((order) => {
    const channel = order.channel || "Unknown";
    const subChannel = order.subChannel || "Unknown";
    const label = `${channel} / ${subChannel}`;

    map[label] = (map[label] || 0) + 1; // <-- count each order, not sum amount
  });

  const labels = Object.keys(map);
  const data = labels.map((label) => map[label]);

  return { labels, data };
}

export default aggregateChannels;
