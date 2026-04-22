import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { shuffleArray } from '../utils/excelParser';
import './AuctionPhase.css';

const AuctionPhase = ({ players, teams, onComplete }) => {
  console.log('=== AuctionPhase Render ===');
  console.log('Players count:', players?.length);
  console.log('Teams count:', teams?.length);
  console.log('Teams data:', JSON.stringify(teams, null, 2));

  const [currentTeams, setCurrentTeams] = useState(teams);
  const [auctionQueue, setAuctionQueue] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      console.log('=== Setting up auction ===');
      console.log('Teams:', teams);

      if (!teams || !Array.isArray(teams)) {
        console.error('Teams is not an array:', teams);
        return;
      }

      if (!players || !Array.isArray(players)) {
        console.error('Players is not an array:', players);
        return;
      }

      const assignedPlayerIds = teams.flatMap(team => {
        if (!team.members || !Array.isArray(team.members)) {
          console.warn('Team has no members array:', team);
          return [];
        }
        return team.members.map(m => m?.id).filter(id => id != null);
      });

      console.log('Assigned player IDs:', assignedPlayerIds);

      const unassignedPlayers = players.filter(p => p && !assignedPlayerIds.includes(p.id));
      console.log('Unassigned players count:', unassignedPlayers.length);

      const shuffled = shuffleArray(unassignedPlayers);
      setAuctionQueue(shuffled);

      if (shuffled.length > 0) {
        setCurrentPlayer(shuffled[0]);
        setBidAmount(shuffled[0].startPrice || 0);
        console.log('First player set:', shuffled[0]);
      } else {
        console.log('No players to auction');
      }
    } catch (error) {
      console.error('Error in useEffect:', error);
    }
  }, [players, teams]);

  const handleSold = () => {
    if (!selectedTeamId || !bidAmount || bidAmount <= 0) return;

    const teamId = parseInt(selectedTeamId);
    const price = parseInt(bidAmount);
    const team = currentTeams.find(t => t.id === teamId);

    if (!team || (team.budget || 0) - (team.spent || 0) < price) return;

    // 保存当前状态到历史记录
    setHistory([...history, {
      teams: currentTeams,
      queue: auctionQueue,
      player: currentPlayer,
      action: 'sold',
      teamId: teamId,
      price: price
    }]);

    const updatedTeams = currentTeams.map(t => {
      if (t.id === teamId) {
        return {
          ...t,
          members: [...(t.members || []), { ...currentPlayer, auctionPrice: price }],
          spent: (t.spent || 0) + price
        };
      }
      return t;
    });

    setCurrentTeams(updatedTeams);
    moveToNextPlayer();
  };

  const handlePass = () => {
    // 保存当前状态到历史记录
    setHistory([...history, {
      teams: currentTeams,
      queue: auctionQueue,
      player: currentPlayer,
      action: 'pass'
    }]);

    moveToNextPlayer();
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const lastState = history[history.length - 1];
    setCurrentTeams(lastState.teams);
    setAuctionQueue(lastState.queue);
    setCurrentPlayer(lastState.player);
    setSelectedTeamId('');
    setBidAmount(lastState.player ? (lastState.player.startPrice || 0) : '');
    setHistory(history.slice(0, -1));
  };

  const moveToNextPlayer = () => {
    const remaining = auctionQueue.slice(1);
    setAuctionQueue(remaining);
    const nextPlayer = remaining.length > 0 ? remaining[0] : null;
    setCurrentPlayer(nextPlayer);
    setSelectedTeamId('');
    setBidAmount(nextPlayer ? (nextPlayer.startPrice || 0) : '');

    if (remaining.length === 0) {
      onComplete(currentTeams);
    }
  };

  if (!currentPlayer) {
    return (
      <div className="phase-container section-dark">
        <div className="container">
          <div className="phase-header">
            <h1 className="display-hero">拍卖完成</h1>
            <p className="sub-heading">所有选手已分配完毕</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phase-container section-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="phase-header"
        >
          <h1 className="display-hero">拍卖进行中</h1>
          <div className="remaining-count caption-bold">
            剩余 {auctionQueue.length} 名选手
          </div>
        </motion.div>

        <div className="auction-layout">
          <div className="auction-sidebar">
            <div className="teams-status">
              <div className="status-header">
                <h3 className="card-title" style={{ color: 'var(--white)', fontSize: '16px' }}>队伍状态</h3>
              </div>

              {currentTeams && currentTeams.map(team => {
                const remaining = (team.budget || 0) - (team.spent || 0);
                const isLow = team.budget && remaining < team.budget * 0.2;
                const memberCount = team.members ? team.members.length : 0;

                return (
                  <div key={team.id} className="team-status-item">
                    <div className="team-status-header">
                      <span className="team-status-name">{team.name || '未命名'}</span>
                      <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px' }}>
                        {memberCount}人
                      </span>
                    </div>

                    <div className="team-status-budget">
                      <span className="budget-label-small">剩余</span>
                      <span className={`budget-value ${isLow ? 'low' : ''}`}>
                        ¥{remaining.toLocaleString()}
                      </span>
                    </div>

                    <div className="team-status-budget">
                      <span className="budget-label-small">已花费</span>
                      <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                        ¥{(team.spent || 0).toLocaleString()}
                      </span>
                    </div>

                    {team.members && team.members.length > 0 && (
                      <div className="team-members-list">
                        {team.members.map(member => (
                          <div key={member.id} className="team-member-item">
                            <span className="member-name-small">{member.name}</span>
                            <span className="member-position-small">
                              {member.mainPosition && `★${member.mainPosition.replace('号位', '')} `}
                              {member.position}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="auction-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPlayer.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4 }}
                className="current-player-showcase"
              >
                <div className="showcase-label caption-bold">当前拍卖选手</div>
                <div className="showcase-avatar">
                  {String(currentPlayer.name || '?').charAt(0)}
                </div>
                <h2 className="showcase-name">{currentPlayer.name}</h2>

                <div className="showcase-stats">
                  <div className="showcase-stat">
                    <span className="showcase-stat-value">{currentPlayer.mmr}</span>
                    <span className="showcase-stat-label caption">自爆分数</span>
                  </div>
                  <div className="showcase-stat">
                    <span className="showcase-stat-value">{currentPlayer.selfRating || 'N/A'}</span>
                    <span className="showcase-stat-label caption">自评</span>
                  </div>
                  <div className="showcase-stat">
                    <span className="showcase-stat-value">
                      {currentPlayer.mainPosition && `★${currentPlayer.mainPosition.replace('号位', '')} `}
                      {currentPlayer.position}
                    </span>
                    <span className="showcase-stat-label caption">位置</span>
                  </div>
                  {currentPlayer.startPrice > 0 && (
                    <div className="showcase-stat">
                      <span className="showcase-stat-value">¥{currentPlayer.startPrice}</span>
                      <span className="showcase-stat-label caption">起拍价</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="auction-controls">
              <div className="controls-header">
                <h3 className="card-title" style={{ color: 'var(--white)' }}>拍卖操作</h3>
              </div>

              <div className="team-selector">
                <label>选择队伍</label>
                <select
                  className="team-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">-- 选择获得该选手的队伍 --</option>
                  {currentTeams && currentTeams.map(team => {
                    const remaining = (team.budget || 0) - (team.spent || 0);
                    return (
                      <option key={team.id} value={team.id}>
                        {team.name} (剩余: ¥{remaining.toLocaleString()})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="price-input-group">
                <label>成交价格</label>
                <div className="price-input-wrapper">
                  <input
                    type="number"
                    className="price-input"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="action-buttons">
                <button
                  className="btn-success"
                  onClick={handleSold}
                  disabled={!selectedTeamId || !bidAmount || bidAmount <= 0}
                >
                  确认成交
                </button>
                <button className="btn-pass" onClick={handlePass}>
                  流拍 / 跳过
                </button>
                <button
                  className="btn-undo"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  title="撤销上一步操作"
                >
                  ↶ 撤销
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPhase;
