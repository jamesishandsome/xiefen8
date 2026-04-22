import { useState } from 'react';
import { motion } from 'framer-motion';
import PlayerCard from './PlayerCard';
import './TeamAssignment.css';

const TeamAssignment = ({ players, teams, captainIds, onComplete }) => {
  const [currentTeams, setCurrentTeams] = useState(teams);
  const [unassignedPlayers, setUnassignedPlayers] = useState(
    players.filter(p => !captainIds.includes(p.id))
  );
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handlePlayerClick = (player) => {
    if (selectedPlayer?.id === player.id) {
      setSelectedPlayer(null);
    } else {
      setSelectedPlayer(player);
    }
  };

  const handleTeamClick = (teamId) => {
    if (!selectedPlayer) return;

    // 将选中的选手添加到队伍
    setUnassignedPlayers(unassignedPlayers.filter(p => p.id !== selectedPlayer.id));
    setCurrentTeams(currentTeams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          members: [...team.members, selectedPlayer]
        };
      }
      return team;
    }));
    setSelectedPlayer(null);
  };

  const removeFromTeam = (teamId, playerId) => {
    const team = currentTeams.find(t => t.id === teamId);
    const player = team.members.find(m => m.id === playerId);

    if (player && player.id !== team.captain.id) {
      setCurrentTeams(currentTeams.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            members: t.members.filter(m => m.id !== playerId)
          };
        }
        return t;
      }));
      setUnassignedPlayers([...unassignedPlayers, player]);
    }
  };

  const handleComplete = () => {
    console.log('TeamAssignment complete, teams:', currentTeams);
    console.log('Team members:', currentTeams.map(t => ({ id: t.id, name: t.name, members: t.members.length })));
    onComplete(currentTeams);
  };

  return (
    <div className="phase-container section-light">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="phase-header"
        >
          <h1 className="display-hero" style={{ color: 'var(--near-black)' }}>分配队员</h1>
          <p className="sub-heading" style={{ color: 'var(--text-secondary)' }}>
            点击选手，然后点击队伍将其分配
          </p>
        </motion.div>

        <div className="assignment-layout">
          <div className="unassigned-section">
            <h2 className="section-heading" style={{ color: 'var(--near-black)' }}>待分配选手</h2>
            <div className="unassigned-count caption-bold">
              剩余 {unassignedPlayers.length} 名选手
              {selectedPlayer && <span style={{ marginLeft: '10px', color: 'var(--accent-blue)' }}>
                已选中: {selectedPlayer.name}
              </span>}
            </div>
            <div className="unassigned-list">
              {unassignedPlayers.map(player => (
                <div
                  key={player.id}
                  onClick={() => handlePlayerClick(player)}
                  style={{
                    cursor: 'pointer',
                    opacity: selectedPlayer?.id === player.id ? 0.6 : 1,
                    border: selectedPlayer?.id === player.id ? '2px solid var(--accent-blue)' : 'none',
                    borderRadius: '12px'
                  }}
                >
                  <PlayerCard player={player} compact />
                </div>
              ))}
            </div>
          </div>

          <div className="teams-section">
            <h2 className="section-heading" style={{ color: 'var(--near-black)' }}>队伍</h2>
            <div className="teams-grid">
              {currentTeams.map(team => (
                <div
                  key={team.id}
                  className="team-card"
                  onClick={() => handleTeamClick(team.id)}
                  style={{
                    cursor: selectedPlayer ? 'pointer' : 'default',
                    opacity: selectedPlayer ? 1 : 0.9
                  }}
                >
                  <div className="team-header">
                    <h3 className="card-title" style={{ color: 'var(--near-black)' }}>{team.name}</h3>
                    <span className="team-count caption">
                      {team.members.length} 人
                    </span>
                  </div>
                  <div className="team-members">
                    {team.members.map(member => (
                      <div key={member.id} className="team-member">
                        <div className="member-info">
                          <span className="member-name body-emphasis">{member.name}</span>
                          {member.id === team.captain.id && (
                            <span className="captain-badge">队长</span>
                          )}
                        </div>
                        {member.id !== team.captain.id && (
                          <button
                            className="member-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromTeam(team.id, member.id);
                            }}
                            aria-label="移除队员"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="phase-actions"
        >
          <button className="btn-primary btn-large" onClick={handleComplete}>
            继续下一步
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TeamAssignment;
