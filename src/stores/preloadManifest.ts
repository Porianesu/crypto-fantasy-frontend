import openPackVideo from '../assets/video/open_pack.webm'
import bgm from '../assets/audio/background_music.mp3'
import drawCardSound from '../assets/audio/draw_card_final.mp3'
import flipCardSound from '../assets/audio/flip_card_final.mp3'
const avatars = import.meta.glob('../assets/images/avatars/*.png', {
  eager: true,
  import: 'default',
})
import card_background from '../assets/images/cards/card_background.png'
import card_border_0 from '../assets/images/cards/card_border_0.png'
import card_border_1 from '../assets/images/cards/card_border_1.png'
import card_border_2 from '../assets/images/cards/card_border_2.png'
import card_border_3 from '../assets/images/cards/card_border_3.png'
const introductionPageImages = import.meta.glob('../assets/images/introduction_page/*.png', {
  eager: true,
  import: 'default',
})
const homePageImages = import.meta.glob('../assets/images/home_page/*.png', {
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
  ...Object.keys(avatars).map((key) => ({
    src: avatars[key],
  })),
  {
    src: card_background,
  },
  {
    src: card_border_0,
  },
  {
    src: card_border_1,
  },
  {
    src: card_border_2,
  },
  {
    src: card_border_3,
  },
  ...Object.keys(introductionPageImages).map((key) => ({
    src: introductionPageImages[key],
  })),
  ...Object.keys(homePageImages).map((key) => ({
    src: homePageImages[key],
  })),
  ...Object.keys(cardsBagModalImages).map((key) => ({
    src: cardsBagModalImages[key],
  })),
  ...Object.keys(galleryPageImages).map((key) => ({
    src: galleryPageImages[key],
  })),
]
