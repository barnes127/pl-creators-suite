import {
  Component,
} from "react";

import type {
  ErrorInfo,
  ReactNode,
} from "react";


type DashboardWidgetErrorBoundaryProps = {
  widgetTitle:
    string;

  children:
    ReactNode;
};


type DashboardWidgetErrorBoundaryState = {
  failed:
    boolean;
};


export class DashboardWidgetErrorBoundary
  extends Component<
    DashboardWidgetErrorBoundaryProps,
    DashboardWidgetErrorBoundaryState
  > {
  state:
    DashboardWidgetErrorBoundaryState = {
      failed:
        false,
    };


  static getDerivedStateFromError():
    DashboardWidgetErrorBoundaryState {
    return {
      failed:
        true,
    };
  }


  componentDidCatch(
    error:
      Error,
    info:
      ErrorInfo,
  ) {
    console.error(
      `Command Center widget failed: ${this.props.widgetTitle}`,
      error,
      info,
    );
  }


  render() {
    if (
      this.state.failed
    ) {
      return (
        <div
          className="commandCenterWidgetFailure"
          role="alert"
        >
          <strong>
            {this.props.widgetTitle}
          </strong>

          <span>
            This widget failed to load.
          </span>
        </div>
      );
    }


    return this.props.children;
  }
}
