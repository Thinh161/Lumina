import { Alert, Platform, DeviceEventEmitter } from 'react-native';

export const CONFIRM_EVENT = 'LUMINA_CONFIRM';

export const confirmAlert = (title, msg, onOk, destructive = false) => {
    if (Platform.OS === 'web') {
        DeviceEventEmitter.emit(CONFIRM_EVENT, { title, message: msg, onOk, destructive });
    } else {
        Alert.alert(title, msg, [
            { text: "Hủy", style: "cancel" },
            { text: "Xác nhận", style: destructive ? "destructive" : "default", onPress: onOk },
        ]);
    }
};
