import { HistoricalInisightData } from 'src/nativemodules/interface';

export const generateFeeStatement = (data: HistoricalInisightData[]) => {
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
  return resultStatement;
};

export const calculateIndicatorScale = (percentageDifference: number): number => {
  // Define limits
  const lowerBound = -100; // Represents -100% change
  const upperBound = 100; // Represents 100% change

  // Cap the percentageDifference within the bounds
  const cappedDifference = Math.max(lowerBound, Math.min(percentageDifference, upperBound));

  // Map the cappedDifference to a 0-100 scale
  return ((cappedDifference - lowerBound) / (upperBound - lowerBound)) * 100;
};

export const generateFeeInsightStatement = (data: HistoricalInisightData[]) => {
  const SECONDS_PER_DAY = 86400; // 24 hours * 60 minutes * 60 seconds

  // Get the most recent entry
  const latest = data[data.length - 1];
  const latestFee = latest.avgFee_75;
  let oneDayAgoFee = null;
  let oneWeekAgoFee = null;

  const latestTimestamp = latest.timestamp;
  for (let i = data.length - 1; i >= 0; i--) {
    const record = data[i];
    const timeDiff = latestTimestamp - record.timestamp;
    if (oneDayAgoFee === null && timeDiff >= SECONDS_PER_DAY) {
      oneDayAgoFee = record.avgFee_75;
    }
    if (timeDiff >= 6 * SECONDS_PER_DAY) {
      oneWeekAgoFee = record.avgFee_75;
      break; // Break the loop once we find the fee from one week ago
    }
  }

  // Determine if the fee has gone up or down compared to one day and one week ago
  const dayComparison = latestFee > oneDayAgoFee ? 'up' : 'down';
  const weekComparison = latestFee > oneWeekAgoFee ? 'up' : 'down';


  return {
    latestFee: `${latestFee}`,
    dayComparisonText: dayComparison,
    oneDayAgoFee:`${oneDayAgoFee}`,
    weekComparisonText: weekComparison,
    oneWeekAgoFee: `${oneWeekAgoFee}`,
  };
};

export const calculateAverageBlockTime = (data: HistoricalInisightData[]) => {
  if (data.length < 2) {
    return '0 mins/block';
  }

  // Calculate the time differences between each block in minutes
  let timeDifferences = [];
  for (let i = 1; i < data.length; i++) {
    let timeDifference = (data[i].timestamp - data[i - 1].timestamp) / 60; // Convert seconds to minutes
    timeDifferences.push(timeDifference);
  }

  // Calculate the average time difference
  const total = timeDifferences.reduce((sum, time) => sum + time, 0);
  const averageBlockTime = total / timeDifferences.length;
  // Set the statement
  return `${averageBlockTime.toFixed(2)} mins/block`;
};
