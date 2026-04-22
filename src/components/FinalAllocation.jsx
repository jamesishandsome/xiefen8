import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import './FinalAllocation.css';

const FinalAllocation = ({ players, teams }) => {
  const [currentTeams, setCurrentTeams] = useState(teams);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const assignedPlayerIds = teams.flatMap(team => team.members.map(m => m.id));
    const unassigned = players.filter(p => !assignedPlayerIds.includes(p.id));
    setAvailablePlayers(unassigned);

    const sortedTeams = [...teams].sort((a, b) => {
      const remainingA = a.budget - a.spent;
      const remainingB = b.budget - b.spent;
      return remainingB - remainingA;
    });
    setCurrentTeams(sortedTeams);

    if (unassigned.length === 0) {
      setIsComplete(true);
    }
  }, [players, teams]);

  const getCurrentTeam = () => currentTeams[currentTeamIndex];

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);
  };

  const handleConfirmPick = () => {
    if (!selectedPlayer) return;

    const currentTeam = getCurrentTeam();
    const remaining = currentTeam.budget - currentTeam.spent;
    const playerPrice = selectedPlayer.startPrice || 1000;

    if (remaining < playerPrice) return;

    const updatedTeams = currentTeams.map(team => {
      if (team.id === currentTeam.id) {
        return {
          ...team,
          members: [...team.members, { ...selectedPlayer, auctionPrice: playerPrice }],
          spent: team.spent + playerPrice
        };
      }
      return team;
    });

    setCurrentTeams(updatedTeams);
    setAvailablePlayers(availablePlayers.filter(p => p.id !== selectedPlayer.id));
    setSelectedPlayer(null);

    const nextIndex = findNextEligibleTeam(updatedTeams, currentTeamIndex);
    if (nextIndex === -1 || availablePlayers.length === 1) {
      setIsComplete(true);
    } else {
      setCurrentTeamIndex(nextIndex);
    }
  };

  const findNextEligibleTeam = (teams, startIndex) => {
    const minPlayerPrice = Math.min(...availablePlayers.map(p => p.startPrice || 1000));
    for (let i = 1; i <= teams.length; i++) {
      const index = (startIndex + i) % teams.length;
      const team = teams[index];
      const remaining = team.budget - team.spent;
      if (remaining >= minPlayerPrice) {
        return index;
      }
    }
    return -1;
  };

  const handleExportToExcel = () => {
    // 准备导出数据
    const exportData = [];

    currentTeams.forEach(team => {
      // 添加队伍标题行
      exportData.push({
        '队伍名称': team.name,
        '队长': team.captain.name,
        '总预算': team.budget,
        '已花费': team.spent,
        '剩余预算': team.budget - team.spent,
        '队员数量': team.members.length
      });

      // 添加队员信息
      exportData.push({
        '队伍名称': '选手姓名',
        '队长': '位置',
        '总预算': '自爆分数',
        '已花费': '成交价格',
        '剩余预算': '角色',
        '队员数量': ''
      });

      team.members.forEach(member => {
        exportData.push({
          '队伍名称': member.name,
          '队长': member.primaryPosition ? `★${member.primaryPosition} ${member.positions?.join('/')}` : member.positions?.join('/') || '',
          '总预算': member.mmr || '',
          '已花费': member.auctionPrice || '',
          '剩余预算': member.id === team.captain.id ? '队长' : '队员',
          '队员数量': ''
        });
      });

      // 添加空行分隔
      exportData.push({});
    });

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, // 队伍名称/选手姓名
      { wch: 20 }, // 队长/位置
      { wch: 15 }, // 总预算/自爆分数
      { wch: 15 }, // 已花费/成交价格
      { wch: 15 }, // 剩余预算/角色
      { wch: 10 }  // 队员数量
    ];

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '队伍分配结果');

    // 导出文件
    const fileName = `Dota2拍卖结果_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  if (isComplete) {
    return (
      <div className="phase-container section-dark">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="completion-message"
          >
            <div className="completion-icon">🏆</div>
            <h1 className="completion-title display-hero">拍卖完成！</h1>
            <p className="completion-subtitle sub-heading">所有队伍已组建完毕</p>
            <button
              className="btn-export-excel"
              onClick={handleExportToExcel}
            >
              📊 导出Excel
            </button>
          </motion.div>

          <div className="teams-final-status">
            {currentTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="team-final-card"
              >
                <div className="team-final-header">
                  <h3 className="team-final-name card-title">{team.name}</h3>
                  <p className="caption" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    队长：{team.captain.name}
                  </p>
                </div>

                <div className="team-final-stats">
                  <div className="final-stat">
                    <span className="final-stat-value">{team.members.length}</span>
                    <span className="final-stat-label caption">队员</span>
                  </div>
                  <div className="final-stat">
                    <span className="final-stat-value">¥{team.spent.toLocaleString()}</span>
                    <span className="final-stat-label caption">已花费</span>
                  </div>
                  <div className="final-stat">
                    <span className="final-stat-value">¥{(team.budget - team.spent).toLocaleString()}</span>
                    <span className="final-stat-label caption">剩余</span>
                  </div>
                </div>

                <div className="team-final-members">
                  {team.members.map(member => (
                    <div key={member.id} className="final-member">
                      <span className="final-member-name caption-bold">
                        {member.name}
                        {member.id === team.captain.id && ' (队长)'}
                      </span>
                      {member.auctionPrice !== null && (
                        <span className="final-member-price caption">
                          ¥{member.auctionPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTeam = getCurrentTeam();
  const remaining = currentTeam ? currentTeam.budget - currentTeam.spent : 0;

  return (
    <div className="phase-container section-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="phase-header"
        >
          <h1 className="display-hero">最终分配</h1>
          <p className="sub-heading">按剩余预算从高到低依次选择选手</p>
        </motion.div>

        <div className="final-allocation-container">
          {currentTeam && (
            <div className="allocation-status">
              <p className="status-message sub-heading">当前选择队伍</p>
              <div className="current-pick-info">
                <span className="pick-team-name body-emphasis">{currentTeam.name}</span>
                <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>|</span>
                <span className="pick-budget body-emphasis">剩余预算: ¥{remaining.toLocaleString()}</span>
                {selectedPlayer && (
                  <>
                    <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>|</span>
                    <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      选手起拍价: ¥{(selectedPlayer.startPrice || 1000).toLocaleString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="available-players-section">
            <h2 className="section-title card-title">可选选手</h2>
            <div className="available-players-grid">
              {availablePlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.3 }}
                  className={`player-pick-card ${selectedPlayer?.id === player.id ? 'selected' : ''}`}
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="pick-card-header">
                    <div className="pick-avatar">{String(player.name || '?').charAt(0)}</div>
                    <div className="pick-info">
                      <div className="pick-name body-emphasis">{player.name}</div>
                      <div className="pick-stats">
                        <span className="pick-stat">自爆分数: {player.mmr}</span>
                        <span className="pick-stat">★{player.primaryPosition} {player.positions?.join('/')}</span>
                        <span className="pick-stat" style={{ color: 'var(--dota-gold)' }}>¥{(player.startPrice || 1000).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="allocation-actions">
              <button
                className="btn-success btn-large"
                onClick={handleConfirmPick}
                disabled={!selectedPlayer}
              >
                确认选择 {selectedPlayer && `(¥${(selectedPlayer.startPrice || 1000).toLocaleString()})`}
              </button>
              <button
                className="btn-pass"
                onClick={() => {
                  const nextIndex = findNextEligibleTeam(currentTeams, currentTeamIndex);
                  if (nextIndex === -1) {
                    setIsComplete(true);
                  } else {
                    setCurrentTeamIndex(nextIndex);
                  }
                }}
              >
                跳过该队
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalAllocation;
