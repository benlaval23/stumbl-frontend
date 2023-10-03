import { StyleSheet } from 'react-native'

import React from 'react'

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
})

export const RNKeyboardAvoidingView = ({
  children,
  enableAutomaticScroll = false,
  ...props
}) => {
  return (
    <KeyboardAwareScrollView
      enableResetScrollToCoords={true}
      keyboardDismissMode={'on-drag'}
      enableOnAndroid={true}
      enableAutomaticScroll={enableAutomaticScroll}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, props.contentContainerStyle]}
      nestedScrollEnabled={true}
      keyboardOpeningTime={Number.MAX_SAFE_INTEGER} // to prevent View scroll under keyboard after first key press on iOS
      {...props}
    >
      <>{children}</>
    </KeyboardAwareScrollView>
  )
}

export default RNKeyboardAvoidingView
