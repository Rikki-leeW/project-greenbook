import welcomeBackground from '../images/backgrounds/welcome-background.png'
import woodenTitleBanner from '../images/decorations/wooden-title-banner.png'

interface WelcomeProps {
    onEnter: () => void
  }
  
  export default function Welcome({
    onEnter,
  }: WelcomeProps) {
    return (
        <main
          className="welcome-page"
          style={{
            backgroundImage: `url(${welcomeBackground})`,
          }}
        >
          <section className="welcome-card">
            <img
              className="welcome-title-banner"
              src={woodenTitleBanner}
              alt=""
              aria-hidden="true"
            />
      
            <div className="welcome-content">
              <p className="app-name">Sprig</p>
      
              <h1>The Garden Keeper</h1>
      
              <p className="welcome-message">
                Welcome, Rikki.
              </p>
      
              <p className="intro">
                Every garden tells a story.
                <br />
                Let&apos;s remember this one together.
              </p>
      
              <button
                type="button"
                className="enter-button"
                onClick={onEnter}
              >
                Enter the garden
              </button>
      
              <p className="keeper-note">
                The Keeper has opened a fresh page in the
                notebook.
              </p>
            </div>
          </section>
        </main>
      )
  }