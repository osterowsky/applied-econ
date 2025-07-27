import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

type OptionKey = 'A' | 'B' | 'C' | 'D'

interface Question {
  Question: string
  A: string
  B: string
  C: string
  D: string
  'Correct Option': OptionKey
  Explanation: string
}

export default function QuestionModel() {
  const [questions,    setQuestions]   = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected,     setSelected]     = useState<OptionKey | null>(null)
  const [answered,     setAnswered]     = useState(false)

  useEffect(() => {
    async function loadSheet() {
      const res = await fetch('/econometrics_questions.xlsx')
      if (!res.ok) return console.error(res.statusText)
      const buf      = await res.arrayBuffer()
      const wb       = XLSX.read(buf, { type: 'array' })
      const sheet    = wb.Sheets[wb.SheetNames[0]]
      const data     = XLSX.utils.sheet_to_json<Question>(sheet)
      setQuestions(data)
    }
    loadSheet()
  }, [])

  const handleClick = (opt: OptionKey) => {
    if (answered) return
    setSelected(opt)
    setAnswered(true)
  }

  const getClass = (opt: OptionKey) => {
    if (!answered) return ''
    if (opt === questions[currentIndex]['Correct Option']) return 'correct'
    if (opt === selected) return 'incorrect'
    return ''
  }

  const nextQuestion = () => {
    setCurrentIndex(i => i + 1)
    setSelected(null)
    setAnswered(false)
  }

  if (!questions.length) return <div>Loading…</div>
  const q = questions[currentIndex]

  return (
    <div className="question-model">
      <h2>{q.Question}</h2>
      <div className="options">
        {(['A','B','C','D'] as OptionKey[]).map(opt => (
          <button
            key={opt}
            onClick={() => handleClick(opt)}
            className={getClass(opt)}
          >
            {q[opt]}
          </button>
        ))}
      </div>

      {answered && (
        <div className="feedback">
          {selected === q['Correct Option']
            ? <p className="you-got-it">🎉 Correct!</p>
            : <p className="you-missed">❌ Nope. It was: {q[q['Correct Option']]}</p>
          }

          {/* pull explanation */}
          <p className="explanation">{q.Explanation}</p>

          <button onClick={nextQuestion}>Next</button>
        </div>
      )}
    </div>
  )
}
