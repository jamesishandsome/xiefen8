import { useState } from 'react';
import { motion } from 'framer-motion';
import PlayerCard from './PlayerCard';
import './CaptainSelection.css';

const CaptainSelection = ({ players, onComplete }) => {
  const [selectedCaptains, setSelectedCaptains] = useState([]);

  const toggleCaptain = (player) => {
    if (selectedCaptains.find(c => c.id === player.id)) {
      setSelectedCaptains(selectedCaptains.filter(c => c.id !== player.id));
    } else {
      if (selectedCaptains.length < 10) {
        setSelectedCaptains([...selectedCaptains, player]);
      }
    }
  };

  const handleComplete = () => {
    if (selectedCaptains.length === 10) {
      const teams = selectedCaptains.map((captain, index) => ({
        id: index + 1,
        name: `${captain.name}队`,
        captain: captain,
        members: [captain],
        budget: 0,
        spent: 0
      }));
      onComplete(teams, selectedCaptains.map(c => c.id));
    }
  };

  return (
    <div className="phase-container section-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="phase-header"
        >
          <h1 className="display-hero">选择队长</h1>
          <p className="sub-heading">从所有选手中选择10名队长，他们将组建自己的队伍</p>
          <div className="captain-counter">
            <span className="counter-current">{selectedCaptains.length}</span>
            <span className="counter-separator">/</span>
            <span className="counter-total">10</span>
          </div>
        </motion.div>

        <div className="selected-captains-bar">
          {selectedCaptains.map((captain, index) => (
            <motion.div
              key={captain.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="captain-chip"
            >
              <span>{captain.name}</span>
              <button
                className="chip-remove"
                onClick={() => toggleCaptain(captain)}
                aria-label="移除队长"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>

        <div className="players-grid">
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
            >
              <PlayerCard
                player={player}
                isSelected={selectedCaptains.find(c => c.id === player.id)}
                onSelect={toggleCaptain}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="phase-actions"
        >
          <button
            className="btn-primary btn-large"
            onClick={handleComplete}
            disabled={selectedCaptains.length !== 10}
          >
            确认队长选择
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CaptainSelection;
