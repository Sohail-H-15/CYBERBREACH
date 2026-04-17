import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { RefreshCw, AlertTriangle, Search, Lock, ShieldAlert } from 'lucide-react';

export default function AdminScreen() {
  const [authHeader, setAuthHeader] = useState('');
  const [loginData, setLoginData] = useState({ id: '', pass: '' });
  const [authError, setAuthError] = useState('');
  
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustData, setAdjustData] = useState({ teamName: '', score: '' });

  const getCommonOptions = useCallback(() => ({
    headers: { 'Authorization': authHeader }
  }), [authHeader]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const token = btoa(`${loginData.id}:${loginData.pass}`);
    const constructedHeader = `Basic ${token}`;
    try {
      await axios.get('/api/admin/verify', { headers: { 'Authorization': constructedHeader } });
      setAuthHeader(constructedHeader);
      setAuthError('');
    } catch (err) {
      setAuthError('INVALID_CREDENTIALS');
    }
  };

  const fetchTeams = useCallback(async () => {
    if (!authHeader) return;
    try {
      const res = await axios.get('/api/admin/teams', getCommonOptions());
      setTeams(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setAuthHeader(''); // Token expired or invalid
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authHeader, getCommonOptions]);

  useEffect(() => {
    if (authHeader) {
      fetchTeams();
      const interval = setInterval(fetchTeams, 5000);
      return () => clearInterval(interval);
    }
  }, [authHeader, fetchTeams]);

  const handleAdjustScore = async () => {
    if (!adjustData.teamName || adjustData.score === '') return;
    try {
      await axios.post('/api/admin/adjust-score', { teamName: adjustData.teamName, score: Number(adjustData.score) }, getCommonOptions());
      setAdjustData({ teamName: '', score: '' });
      fetchTeams();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDisqualify = async (teamName) => {
    if (confirm(`Are you sure you want to disqualify ${teamName}?`)) {
      try {
        await axios.post('/api/admin/disqualify', { teamName }, getCommonOptions());
        fetchTeams();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReset = async (teamName) => {
    if (confirm(`Are you sure you want to reset ${teamName}? All progress will be lost.`)) {
      try {
        await axios.post('/api/admin/reset', { teamName }, getCommonOptions());
        fetchTeams();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Sorting for Tie-Breaker (Fastest time)
  const getDuration = (team) => {
    if (!team.startTime) return 0;
    const end = team.endTime ? new Date(team.endTime).getTime() : Date.now();
    return end - new Date(team.startTime).getTime();
  };

  const sortedAndFilteredTeams = teams
    .filter(t => t.teamName.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return getDuration(a) - getDuration(b);
    });

  if (!authHeader) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="border border-green-500/30 p-8 rounded relative overflow-hidden bg-black max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <Lock className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-center mb-6">SYS_ADMIN_LOGIN</h1>
          {authError && <p className="text-red-500 text-center mb-4">{authError}</p>}
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="ADMIN_ID" 
              className="bg-black border border-green-500/50 px-4 py-2 focus:outline-none focus:border-green-400 text-green-400 w-full"
              value={loginData.id}
              onChange={(e) => setLoginData({...loginData, id: e.target.value})}
              autoComplete="off"
            />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              className="bg-black border border-green-500/50 px-4 py-2 focus:outline-none focus:border-green-400 text-green-400 w-full"
              value={loginData.pass}
              onChange={(e) => setLoginData({...loginData, pass: e.target.value})}
            />
            <button type="submit" className="w-full bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500 hover:text-black transition-colors py-2 font-bold uppercase tracking-widest">
              Initiate Access
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-green-500/30 pb-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold tracking-widest" style={{ textShadow: '0 0 10px rgba(0, 255, 65, 0.5)' }}>SYS_ADMIN_PANEL</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setAuthHeader('')} className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors">
              LOGOUT
            </button>
            <button 
              onClick={fetchTeams}
              className="flex items-center gap-2 px-4 py-2 border border-green-500/50 hover:bg-green-500/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> REFRESH_DATA
            </button>
          </div>
        </header>

        {/* Adjust Score Section */}
        <section className="bg-black border border-green-500/30 p-6 rounded relative overflow-hidden group">
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <h2 className="text-xl mb-4 font-bold tracking-wide">// OVERRIDE_SCORE</h2>
          <div className="flex flex-wrap items-center gap-4">
            <input 
              type="text" 
              placeholder="TARGET_TEAM" 
              className="bg-black border border-green-500/50 px-4 py-2 focus:outline-none focus:border-green-400 text-green-400 w-64"
              value={adjustData.teamName}
              onChange={(e) => setAdjustData({...adjustData, teamName: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="NEW_SCORE" 
              className="bg-black border border-green-500/50 px-4 py-2 focus:outline-none focus:border-green-400 text-green-400 w-32"
              value={adjustData.score}
              onChange={(e) => setAdjustData({...adjustData, score: e.target.value})}
            />
            <button 
              onClick={handleAdjustScore}
              className="bg-green-500/20 text-green-400 border border-green-500 hover:bg-green-500 hover:text-black transition-colors px-6 py-2 font-bold"
            >
              EXECUTE_OVERRIDE
            </button>
          </div>
        </section>

        {/* Live Leaderboard */}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <h2 className="text-2xl font-bold tracking-wide">// LIVE_LEADERBOARD</h2>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-green-500/50" />
              <input 
                type="text" 
                placeholder="SEARCH_TEAMS..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black border border-green-500/30 pl-10 pr-4 py-2 focus:outline-none focus:border-green-400 text-green-400 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-green-500/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-green-500/30 bg-green-500/10">
                  <th className="p-4">RANK</th>
                  <th className="p-4">TEAM_NAME</th>
                  <th className="p-4">SCORE</th>
                  <th className="p-4">SOLVED</th>
                  <th className="p-4">TAB_SWITCHES</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">CONTROLS</th>
                </tr>
              </thead>
              <tbody>
                {loading && teams.length === 0 ? (
                  <tr><td colSpan="7" className="p-4 text-center animate-pulse text-green-500/50">FETCHING_DATA...</td></tr>
                ) : sortedAndFilteredTeams.length === 0 ? (
                  <tr><td colSpan="7" className="p-4 text-center text-green-500/50">NO_TEAMS_FOUND</td></tr>
                ) : (
                  sortedAndFilteredTeams.map((team, index) => {
                    const isSuspicious = team.tabSwitchCount > 3;
                    return (
                      <tr key={team.teamName} className={`border-b border-green-500/10 hover:bg-green-500/5 transition-colors ${isSuspicious ? 'bg-red-900/10' : ''}`}>
                        <td className="p-4 font-bold">#{index + 1}</td>
                        <td className="p-4 flex items-center gap-2 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                          {team.teamName}
                          {isSuspicious && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" title="High Tab Switches" />}
                        </td>
                        <td className="p-4 font-bold text-xl">{team.score}</td>
                        <td className="p-4">{team.solvedQuestions.length} / 10</td>
                        <td className={`p-4 font-bold ${isSuspicious ? 'text-red-500' : 'text-green-500'}`}>
                          {team.tabSwitchCount}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs border ${team.isFinished ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                            {team.isFinished ? 'FINISHED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button 
                            onClick={() => setAdjustData({ teamName: team.teamName, score: team.score })}
                            className="px-3 py-1 text-xs border border-green-500/50 hover:bg-green-500 hover:text-black transition-colors"
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => handleReset(team.teamName)}
                            className="px-3 py-1 text-xs border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-black transition-colors"
                          >
                            RESET
                          </button>
                          <button 
                            onClick={() => handleDisqualify(team.teamName)}
                            className="px-3 py-1 text-xs border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            D/Q
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
