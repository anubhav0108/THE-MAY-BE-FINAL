
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-1">
        <p className="text-3xl font-bold tracking-wider">{format(time, 'hh:mm:ss a')}</p>
        <p className="text-sm text-muted-foreground">{format(time, 'eeee, d MMMM, yyyy')}</p>
    </div>
  );
}
