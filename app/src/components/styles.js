import { create } from 'jss'
import preset from 'jss-preset-default'

const jss = create(preset())

const styles = {
  hidden: {
    display: 'none'
  },
  flex: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    display: 'flex !important'
  },
  fadeIn: {
    opacity: 0,
    animationFillMode: 'forwards',
    animation: 'fadein 0.8s ease-in-out'
  }
}

export default jss.createStyleSheet(styles).attach().classes
