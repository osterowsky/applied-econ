import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import './QuestionModel.css'

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

interface Props {
  topicName: string
}

export default function QuestionModel({ topicName }: Props) {
  const [questions,    setQuestions]   = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected,     setSelected]     = useState<OptionKey | null>(null)
  const [answered,     setAnswered]     = useState(false)

  useEffect(() => {
    async function loadSheet() {
      const res = await fetch('/econometrics_questions.xlsx')
      const buf = await res.arrayBuffer()
      const wb  = XLSX.read(buf, { type: 'array' })

      // grab the sheet by the exact name the user clicked
      const ws = wb.Sheets[topicName]
      if (!ws) {
        console.error(`No sheet called “${topicName}”`)
        setQuestions([])
        return
      }

      const data = XLSX.utils.sheet_to_json<Question>(ws)
      setQuestions(data)
      setCurrentIndex(0)
      setSelected(null)
      setAnswered(false)
    }
    loadSheet()
  }, [topicName])

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

  if (!questions.length) return <div>Error, sorry</div>
  const q = questions[currentIndex]

  return (
    <div className="question-model">
      <h2>{q.Question}</h2>
      {/* Display question number and total count */}
      <p className="counter">
          {currentIndex + 1}/{questions.length}
      </p>

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
