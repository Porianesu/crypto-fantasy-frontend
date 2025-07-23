import openPackVideo from '../assets/video/open_pack.webm'
import meltCardVideo from '../assets/video/melt_card.webm'
import craftCardVideo from '../assets/video/craft_card.webm'
import bgm from '../assets/audio/background_music.mp3'
import introductionSound from '../assets/audio/introduction.mp3'
import drawCardSound from '../assets/audio/draw_card_final.mp3'
import flipCardSound from '../assets/audio/flip_card_final.mp3'
import craftSound from '../assets/audio/craft_sound_v2.mp3'
import craftSuccessSound from '../assets/audio/craft_success_sound.mp3'
import craftFailedSound from '../assets/audio/craft_failed_sound.mp3'
import meltSound from '../assets/audio/melt_sound.mp3'

const avatars = import.meta.glob('../assets/images/avatars/*.png', {
  eager: true,
  import: 'default',
})
const cardImages = import.meta.glob('../assets/images/cards/*.png', {
  eager: true,
  import: 'default',
})
const introductionPageImages = import.meta.glob('../assets/images/introduction_page/*.png', {
  eager: true,
  import: 'default',
})
const homePageImages = import.meta.glob('../assets/images/home_page/*.png', {
  eager: true,
  import: 'default',
})
const battleModalImages = import.meta.glob('../assets/images/home_page/battle_modal/*.png', {
  eager: true,
  import: 'default',
})
const cardsBagModalImages = import.meta.glob('../assets/images/home_page/cards_bag_modal/*.png', {
  eager: true,
  import: 'default',
})
const galleryPageImages = import.meta.glob('../assets/images/gallery_page/*.png', {
  eager: true,
  import: 'default',
})

export default [
  {
    id: 'cardsData',
    src: '/json/cards_data.json',
  },
  {
    id: 'openPackVideo',
    src: openPackVideo,
    type: 'video',
  },
  {
    id: 'meltCardVideo',
    src: meltCardVideo,
    type: 'video',
  },
  {
    id: 'craftCardVideo',
    src: craftCardVideo,
    type: 'video',
  },
  {
    id: 'bgm',
    src: bgm,
  },
  {
    id: 'drawCardSound',
    src: drawCardSound,
  },
  {
    id: 'flipCardSound',
    src: flipCardSound,
  },
  {
    id: 'introductionSound',
    src: introductionSound,
  },
  {
    id: 'craftSound',
    src: craftSound,
  },
  {
    id: 'craftSuccessSound',
    src: craftSuccessSound,
  },
  {
    id: 'craftFailedSound',
    src: craftFailedSound,
  },
  {
    id: 'meltSound',
    src: meltSound,
  },
  ...Object.keys(avatars).map((key) => ({
    src: avatars[key],
  })),
  ...Object.keys(cardImages).map((key) => ({
    src: cardImages[key],
  })),
  ...Object.keys(introductionPageImages).map((key) => ({
    src: introductionPageImages[key],
  })),
  ...Object.keys(homePageImages).map((key) => ({
    src: homePageImages[key],
  })),
  ...Object.keys(battleModalImages).map((key) => ({
    src: battleModalImages[key],
  })),
  ...Object.keys(cardsBagModalImages).map((key) => ({
    src: cardsBagModalImages[key],
  })),
  ...Object.keys(galleryPageImages).map((key) => ({
    src: galleryPageImages[key],
  })),
]
