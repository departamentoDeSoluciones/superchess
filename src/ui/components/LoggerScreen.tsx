import { useEffect, useRef, useState } from 'react';
import { logger } from '../../engine/core/Logger';

export const LoggerScreen = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);




  useEffect(() => {
    const unsubscribe = logger.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    return () => unsubscribe();

  }, []);



  return (
    <div
      style={{
        height: '400px',
        overflowY: 'auto',
        backgroundColor: '#1a1a1a',
        color: '#d4d4d4',
        padding: '10px',
        fontFamily: 'monospace'
      }}
    >
      {logs.map((log, index) => (
        <div key={index} style={{ marginBottom: '4px' }}>
          <span style={{ color: '#569cd6' }}>{`>`}</span> {log}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>

  );


}
