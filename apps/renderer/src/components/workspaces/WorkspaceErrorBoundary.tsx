import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from "react";


type Props = {
  workspace: string;
  children: ReactNode;
};


type State = {
  error: Error | null;
};


export class WorkspaceErrorBoundary
  extends Component<Props, State> {

  state: State = {
    error: null,
  };


  static getDerivedStateFromError(
    error: Error,
  ): State {
    return {
      error,
    };
  }


  componentDidCatch(
    error: Error,
    info: ErrorInfo,
  ) {
    console.error(
      `[Workspace ${this.props.workspace}] render failure`,
      error,
      info,
    );
  }


  componentDidUpdate(
    previousProps: Props,
  ) {
    if (
      previousProps.workspace !==
        this.props.workspace &&
      this.state.error
    ) {
      this.setState({
        error: null,
      });
    }
  }


  render() {
    if (
      this.state.error
    ) {
      return (
        <div
          className="emptyState"
          role="alert"
        >
          <strong>
            {
              this.props
                .workspace
            }{" "}
            encountered an error.
          </strong>

          <div>
            The workspace was
            isolated so the rest
            of PL Creators Suite
            can continue running.
          </div>

          <div>
            {
              this.state.error
                .message
            }
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
