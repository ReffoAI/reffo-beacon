import { useState, useEffect } from 'react';

function CountdownTimer({ targetDate }: { targetDate: number }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Update the count down every 1 second
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      // Time calculations for  hours, minutes and seconds
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      setTimeLeft(`${hours || 0}:${minutes || 0}:${seconds || 0}`);

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft('EXPIRED');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span>{timeLeft}</span>
  );
}

export default CountdownTimer;
