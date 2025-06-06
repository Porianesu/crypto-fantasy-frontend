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
import home_asset_bg from '../assets/images/home_page/asset_background.png'
import home_asset_icon_1 from '../assets/images/home_page/asset_icon_1.png'
import home_asset_icon_2 from '../assets/images/home_page/asset_icon_2.png'
import home_asset_plus_btn from '../assets/images/home_page/asset_plus_button.png'
import home_avatar_bg from '../assets/images/home_page/avatar_background.png'
import home_bg from '../assets/images/home_page/background.png'
import home_card_formation_bg from '../assets/images/home_page/card_formation_background.png'
import home_card_formation_plus_icon from '../assets/images/home_page/card_formation_plus_icon.png'
import home_cards_bag_modal_bg from '../assets/images/home_page/cards_bag_modal/background.png'
import home_cards_bag_modal_close_icon from '../assets/images/home_page/cards_bag_modal/close_icon.png'
import home_cards_bag_modal_down_arrow from '../assets/images/home_page/cards_bag_modal/down_arrow.png'
import home_cards_bag_modal_magnifier from '../assets/images/home_page/cards_bag_modal/magnifier.png'
import home_draw_cards_modal_close_btn from '../assets/images/home_page/draw_cards_modal_close_button.png'
import home_footer_btn_achs from '../assets/images/home_page/footer_button_achs.png'
import home_footer_btn_bag from '../assets/images/home_page/footer_button_bag.png'
import home_footer_btn_battle from '../assets/images/home_page/footer_button_battle.png'
import home_footer_btn_fusion from '../assets/images/home_page/footer_button_fusion.png'
import home_footer_btn_reward from '../assets/images/home_page/footer_button_reward.png'
import home_footer_btn_shop from '../assets/images/home_page/footer_button_shop.png'
import home_header_bg from '../assets/images/home_page/header_background.png'
import home_leaderboard_bg from '../assets/images/home_page/leaderboard_background.png'
import home_leaderboard_current_user_bg from '../assets/images/home_page/leaderboard_current_user_background.png'
import home_leaderboard_item_bg from '../assets/images/home_page/leaderboard_item_background.png'
import home_notification_icon from '../assets/images/home_page/notification_icon.png'
import home_open_package from '../assets/images/home_page/open_package.png'
import home_open_package_btn_bg from '../assets/images/home_page/open_package_button_background.png'
import home_rank_icon_1 from '../assets/images/home_page/rank_icon_1.png'
import home_rank_icon_2 from '../assets/images/home_page/rank_icon_2.png'
import home_rank_icon_3 from '../assets/images/home_page/rank_icon_3.png'
import home_setting_icon from '../assets/images/home_page/setting_icon.png'
import gallery_bg from '../assets/images/gallery_page/background.png'
import gallery_close_icon from '../assets/images/gallery_page/close_icon.png'
import gallery_detail_bg from '../assets/images/gallery_page/detail_background.png'
import gallery_detail_title_bg from '../assets/images/gallery_page/detail_title_background.png'
import gallery_view_detail_btn_bg from '../assets/images/gallery_page/view_detail_button_background.png'
import gallery_view_detail_modal_bg from '../assets/images/gallery_page/view_detail_modal_background.png'

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
  {
    src: home_asset_bg,
  },
  {
    src: home_asset_icon_1,
  },
  {
    src: home_asset_icon_2,
  },
  {
    src: home_asset_plus_btn,
  },
  {
    src: home_avatar_bg,
  },
  {
    src: home_bg,
  },
  {
    src: home_card_formation_bg,
  },
  {
    src: home_card_formation_plus_icon,
  },
  {
    src: home_cards_bag_modal_bg,
  },
  {
    src: home_cards_bag_modal_close_icon,
  },
  {
    src: home_cards_bag_modal_down_arrow,
  },
  {
    src: home_cards_bag_modal_magnifier,
  },
  {
    src: home_draw_cards_modal_close_btn,
  },
  {
    src: home_footer_btn_achs,
  },
  {
    src: home_footer_btn_bag,
  },
  {
    src: home_footer_btn_battle,
  },
  {
    src: home_footer_btn_fusion,
  },
  {
    src: home_footer_btn_reward,
  },
  {
    src: home_footer_btn_shop,
  },
  {
    src: home_header_bg,
  },
  {
    src: home_leaderboard_bg,
  },
  {
    src: home_leaderboard_current_user_bg,
  },
  {
    src: home_leaderboard_item_bg,
  },
  {
    src: home_notification_icon,
  },
  {
    src: home_open_package,
  },
  {
    src: home_open_package_btn_bg,
  },
  {
    src: home_rank_icon_1,
  },
  {
    src: home_rank_icon_2,
  },
  {
    src: home_rank_icon_3,
  },
  {
    src: home_setting_icon,
  },
  {
    src: gallery_bg,
  },
  {
    src: gallery_close_icon,
  },
  {
    src: gallery_detail_bg,
  },
  {
    src: gallery_detail_title_bg,
  },
  {
    src: gallery_view_detail_btn_bg,
  },
  {
    src: gallery_view_detail_modal_bg,
  },
]
