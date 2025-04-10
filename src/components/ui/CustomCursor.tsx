import { useCursor } from '../../hooks/useCursor';
import CursorDot from './cursor/CursorDot';
import CursorRing from './cursor/CursorRing';

interface CustomCursorProps {
  hideDefaultCursor?: boolean;
  dotColor?: string;
  ringColor?: string;
}

const CustomCursor = ({
  hideDefaultCursor = true,
  dotColor,
  ringColor,
}: CustomCursorProps = {}) => {
  const { position, isHovering, isVisible, isClicking } = useCursor({
    hideDefaultCursor,
  });

  return (
    <>
      <CursorDot
        x={position.x}
        y={position.y}
        isVisible={isVisible}
        isHovering={isHovering}
        isClicking={isClicking}
        className={dotColor ? `text-${dotColor}` : ''}
      />
      <CursorRing
        x={position.x}
        y={position.y}
        isVisible={isVisible}
        isHovering={isHovering}
        isClicking={isClicking}
        className={ringColor ? `border-${ringColor}` : ''}
      />
    </>
  );
};

export default CustomCursor;
