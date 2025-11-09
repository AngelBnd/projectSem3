/**
 * Takes an array of sales objects, aggregates total sales by month, 
 * and generates a timeline starting from January of the earliest year found in the data
 * and ending in December of the latest year found in the data.
 * @param {Array<Object>} rawSales - The array of sales objects.
 * @returns {{labels: Array<string>, data: Array<number>}} - Chart-ready data with a continuous timeline.
 */
const aggregateSalesValueByMonth = (rawSales) => {
    if (rawSales.length === 0) {
        return { labels: [], data: [] };
    }

    const monthlyTotals = new Map();
    let minDate = new Date();
    let maxDate = new Date(0); 

    rawSales.forEach(sale => {
        const date = new Date(sale.invoiceDate);
        
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;

        const yearMonthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;

        const amount = parseFloat(sale.totalAmount);
        if (isNaN(amount)) return;

        const currentTotal = monthlyTotals.get(yearMonthKey) || 0;
        monthlyTotals.set(yearMonthKey, currentTotal + amount);
    });

    const labels = [];
    const data = [];
  
    const startYear = minDate.getUTCFullYear();
    let currentDate = new Date(Date.UTC(startYear, 0, 1)); // Month 0 = January

    const endYear = maxDate.getUTCFullYear();
    const endDate = new Date(Date.UTC(endYear + 1, 0, 1)); // January 1st of the NEXT year

    while (currentDate < endDate) { 
        const year = currentDate.getUTCFullYear();
        const month = currentDate.getUTCMonth();
        const yearMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

        const labelDate = new Date(year, month);
        labels.push(labelDate.toLocaleDateString('en-US', { month: 'short'})); 

        
        data.push(monthlyTotals.get(yearMonthKey) || 0);

        currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);
    }

    return { labels, data };
};

export default aggregateSalesValueByMonth;