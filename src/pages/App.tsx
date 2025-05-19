import './App.module.css'
import { observer } from 'mobx-react-lite'
import Card from '@/pages/Card.tsx'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.cardContainer}>
      {Array.from(Array(5)).map((_, index) => (
        <Card
          style={{
            transform: `translateY(${Math.abs(index - 2) * -30}px) translateZ(${(2 - Math.abs(index - 2)) * 70}px)`,
            zIndex: 5 - Math.abs(index - 2), // 中间的卡片在最前面
          }}
          key={index}
        ></Card>
      ))}
    </div>
  )
}

export default observer(App)
