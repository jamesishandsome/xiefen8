import { useState } from 'react';
import { motion } from 'framer-motion';
import './BudgetSetup.css';

const BudgetSetup = ({ teams, onComplete }) => {
  const [budgets, setBudgets] = useState(() => {
    console.log('=== BudgetSetup useState initializer ===');
    console.log('Teams received:', teams);

    if (!teams || !Array.isArray(teams)) {
      console.error('Teams is not an array:', teams);
      return {};
    }

    const initialBudgets = teams.reduce((acc, team) => {
      if (team && team.id) {
        acc[team.id] = 10000;
      }
      return acc;
    }, {});

    console.log('Initial budgets:', initialBudgets);
    return initialBudgets;
  });

  console.log('=== BudgetSetup Render COMPLETE ===');

  const handleBudgetChange = (teamId, value) => {
    const numValue = parseInt(value) || 0;
    setBudgets({
      ...budgets,
      [teamId]: numValue
    });
  };

  const setAllBudgets = (amount) => {
    const newBudgets = {};
    teams.forEach(team => {
      newBudgets[team.id] = amount;
    });
    setBudgets(newBudgets);
  };

  const handleComplete = () => {
    console.log('BudgetSetup complete, teams:', teams);
    console.log('Budgets:', budgets);
    const updatedTeams = teams.map(team => ({
      ...team,
      budget: budgets[team.id],
      spent: 0
    }));
    console.log('Updated teams with budgets:', updatedTeams);
    onComplete(updatedTeams);
  };

  const allBudgetsSet = Object.values(budgets).every(b => b > 0);

  return (
    <div className="phase-container section-dark">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="phase-header"
        >
          <h1 className="display-hero">设置预算</h1>
          <p className="sub-heading">为每个队伍设置拍卖预算</p>
        </motion.div>

        <div className="budget-quick-actions">
          <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>快速设置：</span>
          <button className="btn-pill dark" onClick={() => setAllBudgets(5000)}>
            ¥5,000
          </button>
          <button className="btn-pill dark" onClick={() => setAllBudgets(10000)}>
            ¥10,000
          </button>
          <button className="btn-pill dark" onClick={() => setAllBudgets(15000)}>
            ¥15,000
          </button>
          <button className="btn-pill dark" onClick={() => setAllBudgets(20000)}>
            ¥20,000
          </button>
        </div>

        <div className="budget-grid">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className="budget-card"
            >
              <div className="budget-card-header">
                <div className="team-avatar">
                  {team.captain && team.captain.name ? String(team.captain.name).charAt(0) : '?'}
                </div>
                <div className="team-info">
                  <h3 className="card-title">{team.name || '未命名队伍'}</h3>
                  <p className="caption" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    队长：{team.captain?.name || '未知'}
                  </p>
                </div>
              </div>

              <div className="budget-input-group">
                <label className="budget-label body-emphasis">预算金额</label>
                <div className="budget-input-wrapper">
                  <input
                    type="number"
                    className="budget-input"
                    value={budgets[team.id]}
                    onChange={(e) => handleBudgetChange(team.id, e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="team-members-preview">
                <span className="caption" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  当前队员：{team.members?.length || 0} 人
                </span>
              </div>
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
            disabled={!allBudgetsSet}
          >
            开始拍卖
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetSetup;
