import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useNavigate } from 'react-router-dom'
import { getCardPath } from '@/navigation/routes.tsx'
import {
  EnvelopeIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  GiftIcon,
  TrophyIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BookOpenIcon,
  ArrowRightCircleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Leaderboard from '@/pages/Leaderboard.tsx'

function HomePage() {
  const navigate = useNavigate()
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const handleOpenPackage = () => {
    navigate(getCardPath())
  }
  // mock数据
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
  const handleRightEntryClick = () => {
    alert('跳转到另一个页面')
  }

  // footer按钮配置
  const footerButtons = [
    {
      key: 'market',
      label: 'Market',
      icon: <ShoppingCartIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入市场'),
    },
    {
      key: 'arch',
      label: 'Arch',
      icon: <TrophyIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入成就'),
    },
    {
      key: 'bag',
      label: 'Bag',
      icon: <ShoppingBagIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入背包'),
    },
    {
      key: 'shop',
      label: 'Shop',
      icon: <CurrencyDollarIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入商店'),
    },
    {
      key: 'reward',
      label: 'Reward',
      icon: <GiftIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入奖励'),
    },
    {
      key: 'referral',
      label: 'Referral',
      icon: <UsersIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入礼盒'),
    },
  ]

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={avatarUrl} alt="avatar" className={styles.avatar} />
          <div>
            <span className={styles.username}>{userInfo?.email}</span>
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
                <EnvelopeIcon className={styles.iconSvg + ' text-blue-500'} />
              </button>
              <button className={styles.iconBtn} onClick={handleSettingClick} aria-label="设置">
                <Cog6ToothIcon className={styles.iconSvg + ' text-gray-500'} />
              </button>
            </div>
          </div>
        </div>
        <div className={styles.headerRightBox}>
          <span className={styles.assetIcon}>
            <BanknotesIcon className={styles.assetSvg + ' text-yellow-500'} />
          </span>
          <span className={styles.assetAmount}>{assetAmount}</span>
          <button className={styles.rechargeBtn} onClick={handleRechargeClick} aria-label="充值">
            <PlusCircleIcon className={styles.rechargeSvg + ' text-yellow-600'} />
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <div className="w-full h-full flex flex-1 flex-row items-stretch justify-between">
          {/* 左侧列表/排行榜 */}
          <Leaderboard></Leaderboard>
          {/* 中间抽卡/书本图示 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white shadow flex items-center justify-center mb-6">
              <BookOpenIcon className="w-20 h-20 text-yellow-600" />
            </div>
            <button
              className="flex items-center px-6 py-2 rounded-full bg-yellow-500 text-white font-bold shadow hover:bg-yellow-600 transition"
              onClick={handleOpenPackage}
            >
              Open Pack
              <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
            </button>
          </div>
          {/* 右侧入口展示 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <button
              className="w-4/5 h-3/4 bg-white/70 rounded-xl shadow flex flex-col items-center justify-center hover:bg-yellow-50 transition"
              onClick={handleRightEntryClick}
            >
              <ArrowTopRightOnSquareIcon className="w-12 h-12 text-yellow-500 mb-2" />
              <span className="text-gray-700 font-medium">另一个页面入口</span>
            </button>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(0, 3).map((btn) => (
            <button key={btn.key} className={styles.footerBtn} onClick={btn.onClick}>
              {btn.icon}
              <span className={styles.footerBtnText}>{btn.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(3).map((btn) => (
            <button key={btn.key} className={styles.footerBtn} onClick={btn.onClick}>
              {btn.icon}
              <span className={styles.footerBtnText}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default observer(HomePage)
