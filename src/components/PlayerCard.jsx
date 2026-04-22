import { motion } from 'framer-motion';
import './PlayerCard.css';

const PlayerCard = ({ player, isSelected, onSelect, isDraggable, showPrice, compact }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(player);
    }
  };

  const cardContent = (
    <div className={`player-card ${isSelected ? 'selected' : ''} ${compact ? 'compact' : ''}`} onClick={handleClick}>
      <div className="player-card-header">
        <div className="player-avatar">
          <div className="avatar-placeholder">{String(player.name || '?').charAt(0)}</div>
        </div>
        <div className="player-info">
          <h3 className="card-title">{player.name}</h3>
          <div className="player-stats">
            <span className="stat-badge mmr">自评: {player.mmr}</span>
            {(player.mainPosition || player.position) && (
              <span className="stat-badge position">
                {player.mainPosition && `★${player.mainPosition.replace('号位', '')} `}
                {player.position}
              </span>
            )}
          </div>
        </div>
      </div>

      {!compact && player.startPrice > 0 && (
        <div className="player-detail">
          <span className="detail-label">起拍价</span>
          <span className="detail-value">¥{player.startPrice}</span>
        </div>
      )}

      {showPrice && player.auctionPrice !== null && (
        <div className="auction-price">
          <span className="price-label">成交价</span>
          <span className="price-value">¥{player.auctionPrice}</span>
        </div>
      )}

      {isSelected && (
        <div className="selected-indicator">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="var(--apple-blue)" />
            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  );

  if (isDraggable) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {cardContent}
    </motion.div>
  );
};

export default PlayerCard;
