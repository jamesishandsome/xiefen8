import { useEffect, useRef, useState } from 'react';
import './BouncingText.css';

export default function BouncingText() {
  const textRef = useRef(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [velocity, setVelocity] = useState({ x: 2, y: 1.5 });
  const [color, setColor] = useState(0);

  useEffect(() => {
    const animate = () => {
      if (!textRef.current) return;

      const rect = textRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setPosition(prev => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelX = velocity.x;
        let newVelY = velocity.y;

        // 碰到边界就反弹并换颜色
        if (newX <= 0 || newX >= maxX) {
          newVelX = -velocity.x;
          newX = newX <= 0 ? 0 : maxX;
          setColor(c => (c + 60) % 360);
        }

        if (newY <= 0 || newY >= maxY) {
          newVelY = -velocity.y;
          newY = newY <= 0 ? 0 : maxY;
          setColor(c => (c + 60) % 360);
        }

        if (newVelX !== velocity.x || newVelY !== velocity.y) {
          setVelocity({ x: newVelX, y: newVelY });
        }

        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(animate, 16);
    return () => clearInterval(interval);
  }, [velocity]);

  return (
    <div
      ref={textRef}
      className="bouncing-text"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        filter: `hue-rotate(${color}deg)`,
      }}
    >
      叉爱瓜
    </div>
  );
}
