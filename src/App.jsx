import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CaptainSelection from './components/CaptainSelection';
import TeamAssignment from './components/TeamAssignment';
import BudgetSetup from './components/BudgetSetup';
import AuctionPhase from './components/AuctionPhase';
import FinalAllocation from './components/FinalAllocation';
import { parseExcelFile, loadDefaultExcel } from './utils/excelParser';
import './styles/global.css';
import './App.css';

const PHASES = {
  UPLOAD: 'upload',
  CAPTAIN_SELECTION: 'captain_selection',
  TEAM_ASSIGNMENT: 'team_assignment',
  BUDGET_SETUP: 'budget_setup',
  AUCTION: 'auction',
  FINAL_ALLOCATION: 'final_allocation'
};

function App() {
  const [currentPhase, setCurrentPhase] = useState(PHASES.UPLOAD);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [captainIds, setCaptainIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, loading default Excel...');
    loadDefaultExcel()
      .then(data => {
        console.log('Loaded players:', data.length);
        console.log('First player:', data[0]);
        if (data.length > 0) {
          setPlayers(data);
        } else {
          console.warn('No players loaded from Excel');
        }
      })
      .catch(error => {
        console.error('Error loading default Excel:', error);
      })
      .finally(() => {
        console.log('Loading complete, setting loading to false');
        setLoading(false);
      });
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const parsedPlayers = await parseExcelFile(file);
        setPlayers(parsedPlayers);
        setCurrentPhase(PHASES.CAPTAIN_SELECTION);
      } catch (error) {
        console.error('Failed to parse Excel file:', error);
        alert('文件解析失败，请检查文件格式');
      }
    }
  };

  const handleUseDefault = () => {
    if (players.length > 0) {
      setCurrentPhase(PHASES.CAPTAIN_SELECTION);
    }
  };

  const handleCaptainSelectionComplete = (selectedTeams, selectedCaptainIds) => {
    setTeams(selectedTeams);
    setCaptainIds(selectedCaptainIds);
    setCurrentPhase(PHASES.TEAM_ASSIGNMENT);
  };

  const handleTeamAssignmentComplete = (updatedTeams) => {
    console.log('=== handleTeamAssignmentComplete ===');
    console.log('Updated teams:', updatedTeams);
    console.log('Teams count:', updatedTeams?.length);
    console.log('Teams is array:', Array.isArray(updatedTeams));

    // 验证每个team的结构
    if (Array.isArray(updatedTeams)) {
      updatedTeams.forEach((team, index) => {
        console.log(`Team ${index}:`, {
          id: team?.id,
          name: team?.name,
          captain: team?.captain,
          members: team?.members,
          membersLength: team?.members?.length,
          budget: team?.budget
        });
      });
    }

    setTeams(updatedTeams);
    console.log('Setting phase to budget_setup');
    setCurrentPhase(PHASES.BUDGET_SETUP);
    console.log('Phase set complete');
  };

  const handleBudgetSetupComplete = (teamsWithBudget) => {
    setTeams(teamsWithBudget);
    setCurrentPhase(PHASES.AUCTION);
  };

  const handleAuctionComplete = (teamsAfterAuction) => {
    setTeams(teamsAfterAuction);
    setCurrentPhase(PHASES.FINAL_ALLOCATION);
  };

  console.log('App render - Phase:', currentPhase, 'Players:', players.length, 'Loading:', loading);

  if (loading) {
    return (
      <div className="app">
        <div className="upload-phase section-dark">
          <div className="container">
            <div className="upload-content">
              <div className="upload-hero">
                <h1 className="display-hero">加载中...</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {currentPhase === PHASES.UPLOAD && (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="upload-phase section-dark"
          >
            <div className="container">
              <div className="upload-content">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="upload-hero"
                >
                  <h1 className="display-hero">Dota 2 下分杯</h1>
                  <p className="sub-heading">拍卖选人系统</p>
                  <div className="hero-decoration"></div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="upload-actions"
                >
                  <div className="upload-card">
                    <h2 className="card-title" style={{ color: 'var(--white)', marginBottom: '20px' }}>
                      开始拍卖
                    </h2>
                    <p className="caption" style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px' }}>
                      上传选手池Excel文件，或使用默认选手池开始
                    </p>

                    <div className="upload-buttons">
                      <label className="btn-primary btn-large upload-label">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileUpload}
                          style={{ display: 'none' }}
                        />
                        上传Excel文件
                      </label>

                      {players.length > 0 && (
                        <button className="btn-pill dark" onClick={handleUseDefault}>
                          使用默认选手池 ({players.length}人)
                        </button>
                      )}
                    </div>

                    <div className="upload-hint">
                      <p className="micro" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Excel文件应包含：姓名、MMR、位置、胜率、英雄池、备注等字段
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {currentPhase === PHASES.CAPTAIN_SELECTION && (
          <motion.div
            key="captain"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <CaptainSelection
              players={players}
              onComplete={handleCaptainSelectionComplete}
            />
          </motion.div>
        )}

        {currentPhase === PHASES.TEAM_ASSIGNMENT && (
          <motion.div
            key="assignment"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <TeamAssignment
              players={players}
              teams={teams}
              captainIds={captainIds}
              onComplete={handleTeamAssignmentComplete}
            />
          </motion.div>
        )}

        {currentPhase === PHASES.BUDGET_SETUP && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            {console.log('Rendering BudgetSetup, teams:', teams)}
            <BudgetSetup
              teams={teams}
              onComplete={handleBudgetSetupComplete}
            />
          </motion.div>
        )}

        {currentPhase === PHASES.AUCTION && (
          <motion.div
            key="auction"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <AuctionPhase
              players={players}
              teams={teams}
              onComplete={handleAuctionComplete}
            />
          </motion.div>
        )}

        {currentPhase === PHASES.FINAL_ALLOCATION && (
          <motion.div
            key="final"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4 }}
          >
            <FinalAllocation
              players={players}
              teams={teams}
              minPrice={1000}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
