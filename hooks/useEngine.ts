import quizBankRaw from '@/content/quiz.json'
import { useStore } from '@/lib/store'
import { engine } from '@/engine'
import { getFamiliesByTD } from '@/engine/generators'

type ExamQuestion = {
  id: string
  text: string
  type: 'choice'
  choices: string[]
  correctIndex: number
  category: string
  difficulty: number
  explanation?: string
}

// QCM bank ported from etude-cmm.html — every question has a known answer,
// which is what the exam page needs to score automatically.
const QUIZ_BANK: ExamQuestion[] = (quizBankRaw as any[]).map((q, i) => ({
  id: `qcm-${i}`,
  text: q.question,
  type: 'choice',
  choices: q.options || [],
  correctIndex: typeof q.correct === 'number' ? q.correct : 0,
  category: q.category || 'Général',
  difficulty: 2,
  explanation: q.explanation || '',
}))

const TD_CATEGORY_MAP: Record<string, string[]> = {
  TD1: ['Audio'],
  TD2: ['Image', 'Vidéo'],
  TD3: ['Réseau'],
  TD4: ['Vidéo', 'Réseau'],
  TD5: ['Réseau'],
  TD6: ['Haptique'],
}

function seededShuffle<T>(input: T[], seed: number): T[] {
  let s = seed >>> 0
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const out = [...input]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function useEngine() {
  const { user } = useStore()

  return {
    generateExam: (config: { questionCount?: number; tdScope?: string[]; seed?: number; convention?: 'decimal' | 'binary' } = {}) => {
      const seed = config.seed ?? Math.floor(Math.random() * 0xffffffff)
      const count = Math.max(1, config.questionCount || 20)
      const tds = config.tdScope && config.tdScope.length > 0
        ? config.tdScope
        : ['TD1', 'TD2', 'TD3', 'TD4', 'TD5', 'TD6']

      const categories = new Set(tds.flatMap(td => TD_CATEGORY_MAP[td] || []))
      const scoped = QUIZ_BANK.filter(q => categories.has(q.category))
      const rest = QUIZ_BANK.filter(q => !categories.has(q.category))

      // Prefer questions from the selected TDs, top up with the full bank,
      // and only repeat once the whole bank is exhausted.
      const ordered = seededShuffle(scoped, seed).concat(seededShuffle(rest, seed ^ 0x9e3779b9))
      const pool = ordered.length > 0 ? ordered : seededShuffle(QUIZ_BANK, seed)

      const questions: ExamQuestion[] = []
      let round = 0
      while (questions.length < count && round < 4) {
        const batch = round === 0 ? pool : seededShuffle(QUIZ_BANK, seed + round * 7919)
        for (const q of batch) {
          if (questions.length >= count) break
          questions.push({ ...q, id: `${q.id}-r${round}` })
        }
        round++
      }
      return questions
    },

    generate: (familyId: string, params: any = {}) => {
      return engine.generate(familyId, { seed: 0, convention: 'decimal', ...params })
    },

    solve: (instance: any) => {
      return engine.solve(instance)
    },

    validate: (instance: any, answer: unknown) => {
      return engine.validate(instance, answer)
    },

    classify: (instance: any, answer: unknown) => {
      return engine.classifyError(instance, answer)
    },

    families: engine.listFamilies(),

    getForTD: (td: string) => {
      return getFamiliesByTD(td)
    },

    randomFromTD: (td: string, seed?: number) => {
      const families = getFamiliesByTD(td)
      if (families.length === 0) throw new Error(`No families for TD: ${td}`)
      const family = families[Math.floor(Math.random() * families.length)]
      return engine.generate(family.id, { seed: seed || Math.floor(Math.random() * 0xffffffff), convention: 'decimal' })
    },

    currentUser: user,
  }
}
