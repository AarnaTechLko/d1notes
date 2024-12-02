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
  