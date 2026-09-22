import welcomeBackground from '../images/backgrounds/welcome-garden-desktop.png'
import welcomeBackgroundMobile from '../images/backgrounds/welcome-garden-mobile.png'

interface WelcomeProps {
  onEnter: () => void
  gardenName?: string
}

export default function Welcome({
  onEnter,
  gardenName,
}: WelcomeProps) {
  const trimmedGardenName = gardenName?.trim()
  const enterLabel = trimmedGardenName
    ? `Enter ${trimmedGardenName}`
    : 'Enter your garden'

  return (
    <main className="welcome-page">
      <picture className="welcome-backdrop" aria-hidden="true">
        <source media="(max-width: 620px)" srcSet={welcomeBackgroundMobile} />
        <img src={welcomeBackground} alt="" />
      </picture>

      <div className="welcome-scene">
        <picture className="welcome-artwork" aria-hidden="true">
          <source media="(max-width: 620px)" srcSet={welcomeBackgroundMobile} />
          <img src={welcomeBackground} alt="" />
        </picture>

        <section className="welcome-card" aria-labelledby="welcome-title">
          <div className="welcome-content">
            <p className="welcome-eyebrow">
              <span className="welcome-eyebrow-full">A personal botanical chronicle</span>
              <span className="welcome-eyebrow-short">Botanical chronicle</span>
            </p>

            <h1 id="welcome-title">
              Garden <span>of Mine</span>
            </h1>

            <div className="welcome-divider" aria-hidden="true">
              <span />
              <span className="welcome-divider-leaf">◆</span>
              <span />
            </div>

            <p className="welcome-intro">
              Every garden tells a story.
              <br />
              <span className="welcome-intro-detail">
                <span>You grow the garden.</span>{' '}
                <span>Sprig keeps the story.</span>
              </span>
            </p>

            <button type="button" className="enter-button" onClick={onEnter}>
              {enterLabel}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
