'use client'

import { useState, useCallback } from 'react'

interface Move {
  row: number
  col: number
  player: 1 | 2
}

export default function Home() {
  const [board, setBoard] = useState<number[][]>(
    Array(15).fill(null).map(() => Array(15).fill(0))
  )
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1)
  const [gameOver, setGameOver] = useState(false)
  const [history, setHistory] = useState<Move[]>([])
  const [scores, setScores] = useState({ black: 0, white: 0 })
  const [winner, setWinner] = useState<1 | 2 | null>(null)

  const checkWin = useCallback((row: number, col: number, player: 1 | 2): boolean => {
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]] as const

    for (const [dx, dy] of directions) {
      let count = 1

      for (let i = 1; i < 5; i++) {
        const x = row + dx * i
        const y = col + dy * i
        if (x < 0 || x >= 15 || y < 0 || y >= 15) break
        if (board[x][y] !== player) break
        count++
      }

      for (let i = 1; i < 5; i++) {
        const x = row - dx * i
        const y = col - dy * i
        if (x < 0 || x >= 15 || y < 0 || y >= 15) break
        if (board[x][y] !== player) break
        count++
      }

      if (count >= 5) return true
    }

    return false
  }, [board])

  const makeMove = useCallback((row: number, col: number) => {
    if (gameOver || board[row][col] !== 0) return

    const newBoard = board.map(r => [...r])
    newBoard[row][col] = currentPlayer

    setBoard(newBoard)
    const newHistory = [...history, { row, col, player: currentPlayer }]
    setHistory(newHistory)

    if (checkWin(row, col, currentPlayer)) {
      setGameOver(true)
      setWinner(currentPlayer)
      setScores(prev => ({
        ...prev,
        [currentPlayer === 1 ? 'black' : 'white']: prev[currentPlayer === 1 ? 'black' : 'white'] + 1
      }))
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
    }
  }, [board, currentPlayer, gameOver, history, checkWin])

  const undoMove = useCallback(() => {
    if (history.length === 0 || gameOver) return

    const newHistory = history.slice(0, -1)
    const lastMove = history[history.length - 1]

    const newBoard = board.map(r => [...r])
    newBoard[lastMove.row][lastMove.col] = 0

    setBoard(newBoard)
    setHistory(newHistory)
    setCurrentPlayer(lastMove.player)
    setGameOver(false)
    setWinner(null)
  }, [history, gameOver, board])

  const resetGame = useCallback(() => {
    setBoard(Array(15).fill(null).map(() => Array(15).fill(0)))
    setCurrentPlayer(1)
    setGameOver(false)
    setHistory([])
    setWinner(null)
  }, [])

  const closeWinner = useCallback(() => {
    setWinner(null)
    resetGame()
  }, [resetGame])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, sans-serif"
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#e94560',
        marginBottom: '20px',
        textShadow: '0 0 10px rgba(233, 69, 96, 0.5)'
      }}>
        🎮 五子棋 Gobang
      </h1>

      <div style={{
        display: 'flex',
        gap: '30px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
          padding: '20px',
          borderRadius: '15px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(15, 28px)',
            gap: 0,
            background: '#deb887',
            border: '2px solid #8b4513',
            padding: '2px'
          }}>
            {board.map((row, i) =>
              row.map((cell, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => makeMove(i, j)}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: '1px solid #8b4513',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    background: cell === 0 ? 'transparent' :
                      'radial-gradient(circle at 30% 30%, ' +
                      (cell === 1 ? '#555, #000' : '#fff, #ccc') + ')',
                    borderRadius: cell === 0 ? 0 : '50%',
                    animation: cell !== 0 ? 'dropPiece 0.3s ease-out' : 'none',
                    boxShadow: cell !== 0 ? '0 2px 5px rgba(0,0,0,0.3)' : 'none'
                  }}
                />
              ))
            )}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
          padding: '25px',
          borderRadius: '15px',
          color: '#fff',
          minWidth: '220px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            padding: '15px',
            background: 'rgba(233, 69, 96, 0.2)',
            borderRadius: '10px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div>👤 当前玩家</div>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginTop: '10px',
              color: currentPlayer === 1 ? '#333' : '#fff',
              textShadow: currentPlayer === 2 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
            }}>
              {currentPlayer === 1 ? '⚫ 黑棋' : '⚪ 白棋'}
            </div>
          </div>

          <button
            onClick={resetGame}
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(145deg, #e94560, #c73e54)',
              color: 'white',
              transition: 'transform 0.2s'
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            🔄 重新开始
          </button>

          <button
            onClick={undoMove}
            style={{
              width: '100%',
              padding: '12px',
              margin: '8px 0',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              background: 'linear-gradient(145deg, #4a4a6a, #3a3a5a)',
              color: 'white'
            }}
          >
            ↩️ 悔棋
          </button>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px'
          }}>
            <div style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span>⚫ 黑棋胜</span>
              <span style={{ float: 'right', color: '#333', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                {scores.black}
              </span>
            </div>
            <div style={{ padding: '8px 0' }}>
              <span>⚪ 白棋胜</span>
              <span style={{ float: 'right', color: '#fff', textShadow: '0 0 5px rgba(255,255,255,0.5)' }}>
                {scores.white}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <h3 style={{ color: '#e94560', marginBottom: '10px' }}>📖 游戏规则</h3>
            <p>• 黑棋先手，白棋后手</p>
            <p>• 横/竖/斜连成5子即获胜</p>
            <p>• 点击棋盘落子</p>
          </div>
        </div>
      </div>

      {winner !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeWinner}>
          <div style={{
            background: 'linear-gradient(145deg, #2d2d44, #1a1a2e)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            color: 'white',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <h2 style={{ fontSize: '36px', color: '#e94560', marginBottom: '20px' }}>
              🎉 恭喜!
            </h2>
            <p style={{ fontSize: '24px', marginBottom: '30px' }}>
              {winner === 1 ? '⚫ 黑棋获胜!' : '⚪ 白棋获胜!'}
            </p>
            <button
              onClick={closeWinner}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                background: 'linear-gradient(145deg, #e94560, #c73e54)',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              再来一局
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes dropPiece {
          0% { transform: scale(0) translateY(-20px); opacity: 0; }
          50% { transform: scale(1.2) translateY(0); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
