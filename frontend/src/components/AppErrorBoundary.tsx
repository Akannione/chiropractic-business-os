import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

/**
 * Last-resort UI boundary. It deliberately does not emit the thrown error to
 * analytics because runtime exceptions can contain patient or workflow data.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Keep exception details local. Production telemetry intentionally has
    // automatic exception capture disabled.
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="app-fatal-error" role="alert" aria-labelledby="app-fatal-error-title">
        <section className="app-fatal-error-card">
          <p className="eyebrow">CBOS recovery</p>
          <h1 id="app-fatal-error-title">This workspace could not finish loading.</h1>
          <p>
            Your current screen hit an unexpected application error. Reload CBOS to start a fresh session.
          </p>
          <button type="button" className="primary-button" onClick={this.reload}>
            Reload CBOS
          </button>
        </section>
      </main>
    );
  }
}
