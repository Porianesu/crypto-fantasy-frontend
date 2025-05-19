import './App.module.css'
import { observer } from 'mobx-react-lite'
import Card from '@/pages/Card.tsx'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.cardContainer}>
      {Array.from(Array(5)).map((_, index) => (
        <Card key={index}></Card>
      ))}
    </div>
  )
}

export default observer(App)
