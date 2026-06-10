import styles from './AboutDialog.module.css'

interface Props {
  onClose: () => void
}

export function AboutDialog({ onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        <h2 className={styles.title}>Yukon Solitaire</h2>

        <p className={styles.byline}>
          Made by{' '}
          <a href="http://memorablenaton.es" target="_blank" rel="noreferrer" className={styles.link}>
            Álvaro Cavalcanti
          </a>
        </p>

        <hr className={styles.divider} />

        <p className={styles.supportLabel}>If you enjoy the game, consider supporting:</p>

        <div className={styles.buttons}>
          <a
            href="https://www.buymeacoffee.com/alvarocavalcanti"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
              className={styles.donateImg}
            />
          </a>
          <a
            href="https://ko-fi.com/O4O1WSP5B"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Support on Ko-fi"
              className={styles.donateImg}
            />
          </a>
        </div>
      </div>
    </div>
  )
}
