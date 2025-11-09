/**
 * Calculates the total sales value for each day of the current week (Monday to Sunday).
 * @param {Array<Object>} rawSales - The array of sales objects.
 * @returns {{labels: Array<string>, data: Array<number>}} - Chart-ready data with 7 points (Mon-Sun).
 */
const aggregateSalesValueByCurrentWeekDaily = (rawSales) => {
    if (rawSales.length === 0) {
        return { 
            labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], 
            data: [0, 0, 0, 0, 0, 0, 0] 
        };
    }

    const now = new Date();
    const currentDayOfWeek = now.getDay(); 


    const daysToMonday = (currentDayOfWeek + 6) % 7; 
    

    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
    startDate.setHours(0, 0, 0, 0); 

    const endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999); 
    const dailyTotals = new Map();

    for (let i = 1; i <= 7; i++) {
        dailyTotals.set(i, 0);
    }
    
    rawSales.forEach(sale => {
        const saleDate = new Date(sale.invoiceDate);
        const amount = parseFloat(sale.totalAmount);

        if (saleDate >= startDate && saleDate <= endDate) {
            if (!isNaN(amount)) {

                const dayIndex = (saleDate.getDay() + 6) % 7 + 1; 
                
                const currentTotal = dailyTotals.get(dayIndex) || 0;
                dailyTotals.set(dayIndex, currentTotal + amount);
            }
        }
    });

    const indonesianDayLabels = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
    const data = [];

    for (let i = 1; i <= 7; i++) {
        data.push(dailyTotals.get(i));
    }

    return { 
        labels: indonesianDayLabels, 
        data: data 
    };
};

export default aggregateSalesValueByCurrentWeekDaily;