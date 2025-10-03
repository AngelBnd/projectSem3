/**
 * Aggregates total quantity sold per category using a product lookup map.
 * @param {Array<Object>} rawSales - The array of sales objects.
 * @param {Object} productMap - Map object: { productCode: categoryName }
 * @returns {{labels: Array<string>, data: Array<number>}} - Chart-ready data.
 */
const aggregateCategories = (rawSales, productMap) => {
    const categoryCounts = new Map();

    rawSales.forEach(sale => {
        if (sale.lineItems && Array.isArray(sale.lineItems)) {
            sale.lineItems.forEach(item => {
                const productCode = item.productCode;
                const quantity = parseFloat(item.quantitySold) || 0;

                const category = productMap[productCode]; 

                if (category && quantity > 0) {
                    const currentCount = categoryCounts.get(category) || 0;
                    categoryCounts.set(category, currentCount + quantity);
                }
            });
        }
    });

    const labels = Array.from(categoryCounts.keys());
    const data = Array.from(categoryCounts.values());

    return { labels, data };
};

export default aggregateCategories;