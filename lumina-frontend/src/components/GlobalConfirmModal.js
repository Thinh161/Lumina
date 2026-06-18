import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, DeviceEventEmitter } from 'react-native';
import { CONFIRM_EVENT } from '../utils/confirmAlert';

const GlobalConfirmModal = () => {
    const [modal, setModal] = useState({ visible: false, title: '', message: '', onOk: null, destructive: false });

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener(CONFIRM_EVENT, ({ title, message, onOk, destructive }) => {
            setModal({ visible: true, title, message, onOk, destructive });
        });
        return () => sub.remove();
    }, []);

    const handleCancel = () => setModal(m => ({ ...m, visible: false }));
    const handleOk = () => {
        setModal(m => ({ ...m, visible: false }));
        modal.onOk?.();
    };

    return (
        <Modal visible={modal.visible} animationType="fade" transparent statusBarTranslucent>
            <View style={s.overlay}>
                <View style={s.dialog}>
                    <Text style={s.title}>{modal.title}</Text>
                    <Text style={s.message}>{modal.message}</Text>
                    <View style={s.btnRow}>
                        <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
                            <Text style={s.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.okBtn, modal.destructive && s.okBtnDestructive]} onPress={handleOk}>
                            <Text style={s.okText}>Xác nhận</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    dialog: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    title: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
    message: { fontSize: 14, color: '#666666', lineHeight: 20, marginBottom: 24 },
    btnRow: { flexDirection: 'row', gap: 10 },
    cancelBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 999,
        backgroundColor: '#F5F5F5', alignItems: 'center',
    },
    cancelText: { fontSize: 14, fontWeight: '700', color: '#888888' },
    okBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 999,
        backgroundColor: '#2E7D32', alignItems: 'center',
    },
    okBtnDestructive: { backgroundColor: '#D32F2F' },
    okText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

export default GlobalConfirmModal;
