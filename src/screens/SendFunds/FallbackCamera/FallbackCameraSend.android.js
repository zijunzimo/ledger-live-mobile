/* @flow */
import React, { PureComponent } from "react";
import { translate } from "react-i18next";
import { AppState } from "react-native";
import type { NavigationScreenProp } from "react-navigation";
import OpenSettings from "react-native-open-settings";
import i18next from "i18next";
import type { T } from "../../../types/common";
import FallbackCameraBody from "../../../components/FallbackCameraBody";

type Props = {
  navigation: NavigationScreenProp<*>,
  t: T,
};
type State = {
  appSTate: string,
  openSettingsPressed: boolean,
};
class FallBackCameraScreen extends PureComponent<Props, State> {
  state = {
    appState: AppState.currentState,
    openSettingsPressed: false,
  };

  static navigationOptions = {
    title: i18next.t("send.scan.fallback.header"),
    headerLeft: null,
  };

  componentDidMount() {
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    const { appState, openSettingsPressed } = this.state;
    const { navigation } = this.props;
    if (
      appState.match(/inactive|background/) &&
      nextAppState === "active" &&
      openSettingsPressed
    ) {
      navigation.replace("SendFunds");
    }
    this.setState({ appState: nextAppState });
  };

  openNativeSettings = () => {
    this.setState({ openSettingsPressed: true });
    OpenSettings.openSettings();
  };

  render() {
    const { t } = this.props;
    return (
      <FallbackCameraBody
        title={t("send.scan.fallback.title")}
        description={t("send.scan.fallback.desc")}
        buttonTitle={t("send.scan.fallback.buttonTitle")}
        onPress={this.openNativeSettings}
      />
    );
  }
}

export default translate()(FallBackCameraScreen);
