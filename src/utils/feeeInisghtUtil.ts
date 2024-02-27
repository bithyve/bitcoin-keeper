import { HistoricalInisightData } from "src/nativemodules/interface";

export const generateFeeStatement=(data: HistoricalInisightData[])=>{
    if (data.length === 0) {
      return '';
    }
    // Calculate the historical average of avgFee_75
    const total = data.reduce((sum, record) => sum + record.avgFee_75, 0);
    const historicalAverage = total / data.length;

    // Get the most recent avgFee_75
    const recentFee = data[data.length - 1].avgFee_75;

    // Calculate the percentage difference
    const difference = recentFee - historicalAverage;
    const percentageDifference = (difference / historicalAverage) * 100;

    // Generate the statement
    let resultStatement = '';
    if (difference === 0) {
      resultStatement = 'Fees are the same as the usual average.';
    } else if (difference > 0) {
      resultStatement = `Fees are ${percentageDifference.toFixed(2)}% higher than usual.`;
    } else {
      resultStatement = `Fees are ${Math.abs(percentageDifference).toFixed(2)}% lower than usual.`;
    }
    return resultStatement
  }

  export const calculateIndicatorScale = (percentageDifference: number): number => {
    // Define limits
    const lowerBound = -100; // Represents -100% change
    const upperBound = 100; // Represents 100% change
  
    // Cap the percentageDifference within the bounds
    const cappedDifference = Math.max(lowerBound, Math.min(percentageDifference, upperBound));
  
    // Map the cappedDifference to a 0-100 scale
    return ((cappedDifference - lowerBound) / (upperBound - lowerBound)) * 100;
  };
  
