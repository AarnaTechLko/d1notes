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
  