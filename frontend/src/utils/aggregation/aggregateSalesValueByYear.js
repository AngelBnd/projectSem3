/**
 * Takes an array of sales objects and aggregates total sales by YEAR, 
 * generating a continuous timeline from the earliest year to the latest year found in the data.
 * @param {Array<Object>} rawSales - The array of sales objects.
 * @returns {{labels: Array<string>, data: Array<number>}} - Chart-ready data aggregated yearly.
 */
const aggregateSalesValueByYear = (rawSales) => {
    if (rawSales.length === 0) {
        return { labels: [], data: [] };
    }

    const yearlyTotals = new Map(); 
    let minDate = new Date();
    let maxDate = new Date(0); 

    rawSales.forEach(sale => {
        const date = new Date(sale.invoiceDate);
        
        if (date < minDate) minDate = date;
        if (date > maxDate) maxDate = date;

        const yearKey = date.getUTCFullYear().toString(); 

        const amount = parseFloat(sale.totalAmount);
        if (isNaN(amount)) return;

        const currentTotal = yearlyTotals.get(yearKey) || 0;
        yearlyTotals.set(yearKey, currentTotal + amount);
    });

    const labels = [];
    const data = [];
 
    const startYear = minDate.getUTCFullYear();

    let currentYear = startYear;

    const endYear = maxDate.getUTCFullYear();

    while (currentYear <= endYear) { 
        const yearKey = currentYear.toString();


        labels.push(yearKey);

        data.push(yearlyTotals.get(yearKey) || 0);

  
        currentYear++;
    }

    return { labels, data };
};

export default aggregateSalesValueByYear;