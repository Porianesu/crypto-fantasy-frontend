import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useNavigate } from 'react-router-dom'
import { getCardPath } from '@/navigation/routes.tsx'

function HomePage() {
  const navigate = useNavigate()
  const handleOpenPackage = () => {
    navigate(getCardPath())
  }
  return (
    <div className={styles.pageContainer}>
      <button onClick={handleOpenPackage}>Open Package</button>
    </div>
  )
}

export default observer(HomePage)
