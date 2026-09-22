import { useState, useEffect } from 'react'
import { useTypewriter } from '../../hooks/useTypewriter'

export default function DialogBox({ speaker, text, onComplete, onNext }) {
  const [done, setDone] = useState(false)
  const displayed = useTypewriter(done ? text : text, done ? 0 : 30)
  const isComplete = displayed.length >= text.length

  useEffect(() => {
    if (isComplete && onComplete) onComplete()
  }, [isComplete])

  function handleClick() {
    if (!isComplete) {
      setDone(true)
    } else if (onNext) {
      onNext()
    }
  }

  return (
    <div
      className="absolute bottom-4 left-4 right-4 bg-slate-800/90 border border-slate-600 rounded-xl p-4 cursor-pointer select-none z-20"
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {speaker === 'Sara' && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-lg shadow">😊</div>
          </div>
        )}
        {speaker === 'Protagonista' && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center text-lg shadow">🙂</div>
          </div>
        )}
        <div className="flex-1">
          {speaker && (
            <div className="font-mono text-yellow-400 text-sm mb-1">{speaker}</div>
          )}
          <p className="text-slate-100 text-sm leading-relaxed font-mono">
            {displayed}
            {!isComplete && <span className="animate-pulse">▌</span>}
          </p>
        </div>
      </div>
      {isComplete && (
        <div className="text-right text-slate-400 text-xs mt-2 animate-pulse">▶ continua</div>
      )}
    </div>
  )
}
