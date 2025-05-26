import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useNavigate } from 'react-router-dom'
import { getCardPath } from '@/navigation/routes.tsx'

function HomePage() {
  const navigate = useNavigate()
  const handleOpenPackage = () => {
    navigate(getCardPath())
  }
  // mock数据
  const username = '用户昵称'
  const avatarUrl = 'https://via.placeholder.com/40'
  const assetAmount = 12345
  const expPercent = 68 // mock经验百分比

  const handleMailClick = () => {
    alert('打开通知')
  }
  const handleSettingClick = () => {
    alert('打开设置')
  }
  const handleRechargeClick = () => {
    alert('充值入口')
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={avatarUrl} alt="avatar" className={styles.avatar} />
          <div>
            <span className={styles.username}>{username}</span>
            {/* 经验进度条 */}
            <div className={styles.expBarWrapper}>
              <div className={styles.expBarBg}>
                <div className={styles.expBarFill} style={{ width: `${expPercent}%` }} />
              </div>
              <span className={styles.expBarText}>{expPercent}%</span>
            </div>
            {/* 图标按钮 */}
            <div className={styles.iconBtnRow}>
              <button className={styles.iconBtn} onClick={handleMailClick} aria-label="通知">
                {/* 邮件图标（SVG） */}
                <svg
                  className={styles.iconSvg}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button className={styles.iconBtn} onClick={handleSettingClick} aria-label="设置">
                {/* 齿轮图标（SVG） */}
                <svg
                  className={styles.iconSvg}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 3v2.25m1.5 0V3m-7.5 8.25H3m2.25 1.5H3m16.5-1.5h2.25m-2.25 1.5h2.25M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 0V3m0 18v-2.25m-7.5-7.5H3m18 0h-2.25"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className={styles.headerRightBox}>
          <span className={styles.assetIcon}>
            {/* 资产图标（可替换为实际icon） */}
            <svg
              className={styles.assetSvg}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M8 12h8M12 8v8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className={styles.assetAmount}>{assetAmount}</span>
          <button className={styles.rechargeBtn} onClick={handleRechargeClick} aria-label="充值">
            <svg
              className={styles.rechargeSvg}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.body}>
        {/* 页面主体内容放这里 */}
        <button onClick={handleOpenPackage}>Open Package</button>
      </div>
      <div className={styles.footer}>
        {/* 页脚内容，可自定义 */}
        <span className={styles.footerText}>© 2024 Crypto Fantasy</span>
      </div>
    </div>
  )
}

export default observer(HomePage)
