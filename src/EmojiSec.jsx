import { useState, useRef, useEffect } from 'react'

const EMOJILER = [
  '😀','😁','😂','🤣','😊','😍','😘','😎','🤩','🥳','😉','😏','🙂','🤗',
  '🤔','😴','😅','😇','🙊','😋','😜','🤪','😢','😭','😡','😤','😳','🥲',
  '👍','👎','👏','🙏','💪','👋','🤝','✌️','🤞','👌','🫰','🤙','👀','🧠',
  '🔥','✨','⭐','❤️','🧡','💛','💚','💙','💜','🖤','💯','🎉','🎊','🥂',
  '🎲','🃏','♠️','♥️','♦️','♣️','☕','🍻','🍀','🙌','🤌','😌','🙄','😮',
]

export default function EmojiSec({ onSec }) {
  const [acik, setAcik] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function disTik(e) { if (ref.current && !ref.current.contains(e.target)) setAcik(false) }
    document.addEventListener('mousedown', disTik)
    return () => document.removeEventListener('mousedown', disTik)
  }, [])

  return (
    <div className="emoji-sar" ref={ref}>
      <button type="button" className="emoji-ac" title="Emoji" onClick={() => setAcik(a => !a)}>😊</button>
      {acik && (
        <div className="emoji-panel">
          {EMOJILER.map((e, i) => (
            <button type="button" key={i} className="emoji-oge" onClick={() => onSec(e)}>{e}</button>
          ))}
        </div>
      )}
    </div>
  )
}
