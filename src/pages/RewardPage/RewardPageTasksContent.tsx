import { observer } from 'mobx-react-lite'
import React, { type RefObject, useMemo, useRef, useState } from 'react'
import styles from './RewardPageTasksContent.module.css'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { type IClaimTaskResponse, type ITask, TASK_STATUS } from '@/axios/api.ts'
import classNames from 'classnames'
import { Textfit } from 'react-textfit'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

interface ITaskItemProps {
  index: number
  taskContainerRefs: RefObject<HTMLDivElement[]>
  task: ITask
  handleClaimTask: (task: ITask) => Promise<void>
  handleCompleteTask: (task: ITask) => Promise<void>
}

const TaskItem: React.FC<ITaskItemProps> = ({
  index,
  taskContainerRefs,
  task,
  handleClaimTask,
  handleCompleteTask,
}) => {
  const [buttonLoading, setButtonLoading] = useState(false)

  const onClaimTaskButtonClick = async () => {
    if (buttonLoading) return
    setButtonLoading(true)
    await handleClaimTask(task)
    setButtonLoading(false)
  }

  const onGoCompleteTaskButtonClick = async () => {
    if (buttonLoading) return
    setButtonLoading(true)
    await handleCompleteTask(task)
    setButtonLoading(false)
  }

  return (
    <div
      className={classNames(styles.taskContainer, {
        [styles.taskContainerClaimed]: task.status === TASK_STATUS.REWARD_CLAIMED,
        [styles.taskContainerCompleted]: task.status === TASK_STATUS.COMPLETED,
        [styles.taskContainerUncompleted]: task.status === TASK_STATUS.UNCOMPLETED,
      })}
      ref={(el) => {
        if (el) {
          taskContainerRefs.current[index] = el
        }
      }}
    >
      <div className={styles.descriptionWrapper}>
        <Textfit className={styles.descriptionContainer}>
          {task.description}
          {task.status !== TASK_STATUS.REWARD_CLAIMED ? (
            <button
              className={classNames(styles.goCompleteTaskButton, { button: !buttonLoading })}
              disabled={buttonLoading}
              onClick={onGoCompleteTaskButtonClick}
            >
              Go
            </button>
          ) : null}
        </Textfit>
      </div>
      <div className={styles.rewardWrapper}>
        <div className={classNames(styles.rewardContainer, styles.rewardContainerSol)}>
          {task.status === TASK_STATUS.REWARD_CLAIMED ? (
            <div className={styles.rewardClaimedMask}>Received</div>
          ) : null}
          <div className={styles.rewardImage}></div>
          <div className={styles.rewardAmount}>{task.rewardSolAmount}</div>
        </div>
        <div className={classNames(styles.rewardContainer, styles.rewardContainerFaith)}>
          {task.status === TASK_STATUS.REWARD_CLAIMED ? (
            <div className={styles.rewardClaimedMask}>Received</div>
          ) : null}
          <div className={styles.rewardImage}></div>
          <div className={styles.rewardAmount}>{task.rewardFaithAmount}</div>
        </div>
      </div>
      <div className={styles.buttonWrapper}>
        {task.status !== TASK_STATUS.REWARD_CLAIMED ? (
          <button
            className={classNames(styles.claimButton, {
              button: !buttonLoading,
            })}
            disabled={buttonLoading}
            onClick={onClaimTaskButtonClick}
          ></button>
        ) : null}
      </div>
    </div>
  )
}

interface IRewardPageTasksContentProps {
  openRewardResultModal: (data: RewardResultModalData, title?: string) => void
}

const TaskStatusSortPriority = {
  [TASK_STATUS.COMPLETED]: 0,
  [TASK_STATUS.UNCOMPLETED]: 1,
  [TASK_STATUS.REWARD_CLAIMED]: 2,
}

const RewardPageTasksContent: React.FC<IRewardPageTasksContentProps> = ({
  openRewardResultModal,
}) => {
  const {
    rewardStore: { tasks, initTasks, claimTask },
    thirdPartAppStore: { twitterAccount, getXRequestToken },
  } = useMobxStore()
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const taskContainerRefs = useRef<Array<HTMLDivElement>>([])
  const [showOnlyAchieved, setShowOnlyAchieved] = useState<boolean>(false)
  const [refreshButtonLoading, setRefreshButtonLoading] = useState<boolean>(false)
  const formattedTasks = useMemo(() => {
    const filteredTasks = showOnlyAchieved
      ? tasks.filter((task) => task.status !== TASK_STATUS.UNCOMPLETED)
      : tasks
    return filteredTasks.slice().sort((a, b) => {
      return TaskStatusSortPriority[a.status] - TaskStatusSortPriority[b.status] // 按状态权重排序
    })
  }, [showOnlyAchieved, tasks])

  useGSAP(
    () => {
      if (!tasks.length) return
      if (!taskContainerRefs.current.length) return
      gsap.from(taskContainerRefs.current, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    },
    {
      scope: contentContainerRef,
      dependencies: [tasks.length],
    },
  )

  const handleClaimTask = async (task: ITask) => {
    const result = (await claimTask(task)) as unknown as IClaimTaskResponse
    if (result.success) {
      // 显示奖励弹窗
      openRewardResultModal(
        {
          solAmount: task.rewardSolAmount,
          faithAmount: task.rewardFaithAmount,
        },
        'Task Reward',
      )
    }
  }

  const dealWithTwitterTask = async (task: ITask) => {
    if (!task.subType) return
    if (task.subType === 'bind') {
      if (twitterAccount?.twitterUserId) {
        toast.success('You have already linked an X account')
      } else {
        await getXRequestToken()
      }
    } else {
      if (!twitterAccount?.twitterUserId) {
        return toast.warning('You must link your X account first')
      }
      switch (task.subType) {
        case 'follow':
          break
        default:
          break
      }
    }
  }

  const handleCompleteTask = async (task: ITask) => {
    if (!task || task.status !== TASK_STATUS.UNCOMPLETED) return
    switch (task.type) {
      case 'twitter':
        await dealWithTwitterTask(task)
        break
      default:
        break
    }
  }

  const handleFilterButtonClick = () => {
    setShowOnlyAchieved((prevState) => !prevState)
  }

  const handleRefreshButtonClick = async () => {
    if (refreshButtonLoading) return
    setRefreshButtonLoading(true)
    try {
      await Promise.all([initTasks(), new Promise((resolve) => setTimeout(resolve, 2000))])
    } finally {
      setRefreshButtonLoading(false)
    }
  }

  return (
    <div className={styles.contentContainer} ref={contentContainerRef}>
      <div className={styles.header}>
        <div className={styles.title}>
          Task List
          <button
            className={classNames(styles.refreshButton, {
              button: !refreshButtonLoading,
              'animate-spin': refreshButtonLoading,
            })}
            onClick={handleRefreshButtonClick}
          >
            <ArrowPathIcon></ArrowPathIcon>
          </button>
        </div>
        <div className={styles.headerRightPart}>
          <button
            className={classNames(styles.radioButtonOutside, 'button')}
            onClick={handleFilterButtonClick}
          >
            {showOnlyAchieved ? <div className={styles.radioButtonInside}></div> : null}
          </button>
          <div>Only show achieved</div>
        </div>
      </div>
      <div className={styles.bodyContainer}>
        {tasks.length === 0 ? (
          <div className={styles.loadingText}>Loading . . .</div>
        ) : (
          <div className={styles.body}>
            {formattedTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                index={index}
                taskContainerRefs={taskContainerRefs}
                task={task}
                handleClaimTask={handleClaimTask}
                handleCompleteTask={handleCompleteTask}
              ></TaskItem>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default observer(RewardPageTasksContent)
