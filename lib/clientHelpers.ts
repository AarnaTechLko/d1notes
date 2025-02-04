export const getInitialsAfterComma = (positions: string | null | undefined): string => {
    if (!positions) {
      return ''; // Return an empty string if positions is null or undefined
    }
  
    return positions
      .split(',')
      .map((position) =>
        position
          .trim()
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase())
          .join('') // Combine initials of each word in the segment
      )
      .join(' '); // Join the processed segments with a comma
  };

  
  export const formatDate = (dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
    } catch {
      return 'Invalid date';
    }
  };

  export async function calculateAmount(newcurrency: string, amount: GLfloat) {
    const conversionRate = await getCurrencyInUSD(newcurrency); // Await the promise
    const convertedAmount = conversionRate * amount; // Now the result can be used in arithmetic
    return convertedAmount.toFixed(2);
  }
  
  export function calculateHoursFromNow(dateString: string): number | null {
    try {
      const givenDate = new Date(dateString);
      const currentDate = new Date();
  
      if (isNaN(givenDate.getTime())) {
        throw new Error("Invalid date format");
      }
  
      const timeDifferenceInMilliseconds = currentDate.getTime() - givenDate.getTime();
      const hoursDifference = timeDifferenceInMilliseconds / (1000 * 60 * 60);
  
      return parseFloat(hoursDifference.toFixed(2));
    } catch (error) {
      console.error("Error calculating hours from now:", error);
      return null;
    }
  }

  export const  getCurrencyInUSD= async (currencyCode:any)=> {
    const API_URL = 'https://api.currencyfreaks.com/v2.0/rates/latest';
    const API_KEY = '4338ccbbf22a418187de53f2fc38fb48';
  
    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&symbols=USD,${currencyCode}`);
  
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
  
      const data = await response.json();
      const rates = data.rates;
      const rateToUSD = parseFloat(rates['USD']);
      const rateFromCurrency = parseFloat(rates[currencyCode]);
  
      if (!rateFromCurrency || !rateToUSD) {
        throw new Error('Invalid currency rate data');
      }
 
      const exchangeRateToUSD = rateToUSD / rateFromCurrency;
      return exchangeRateToUSD;
    } catch (error:any) {
      console.error('Error fetching currency rates:', error.message);
      throw new Error('Failed to fetch currency rate');
    }
  }
 
  
  export function getRemainingTime(createdAt: string, turnaroundTime: number): number {
    const createdDate = new Date(createdAt); // Convert created_at to a Date object
    const currentDate = new Date(); // Get current date and time
    const turnaroundTimeInMilliseconds = turnaroundTime * 60 * 60 * 1000; // Assuming turnaroundTime is in hours
  
    const endTime = createdDate.getTime() + turnaroundTimeInMilliseconds; // Calculate end time
    const remainingTimeInMilliseconds = endTime - currentDate.getTime(); // Calculate remaining time
  
    const remainingHours = remainingTimeInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
    return Number(remainingHours.toFixed(2)); // Return remaining time in hours (can be negative)
  }

  export const formatCurrency = (amount: number | string): string => {
    // Convert to string if the input is a number
    const numString = amount.toString();
  
    // Regular expression for Indian numbering system
    const regex = /(\d)(?=(\d\d)+\d$)/g;
  
    // Replace matches with formatted commas
    return numString.replace(/\B(?=(\d{3})+(?!\d))/g, ',').replace(regex, "$1,");
  };
  