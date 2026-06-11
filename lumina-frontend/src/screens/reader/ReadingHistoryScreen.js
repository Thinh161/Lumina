import React, { useEffect, useState, useCallback } from "react";
import {
	View, Text, FlatList, TouchableOpacity, StyleSheet,
	SafeAreaView, ActivityIndicator, Image, RefreshControl
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";

const API_URL = 'http://192.168.10.104:5555/api';
const DEFAULT_COVER = "https://i.pravatar.cc/150?img=5";

const ReadingHistoryScreen = ({ navigation }) => {
	const { user } = useSelector(state => state.auth);
	const [history, setHistory] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const loadHistory = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		try {
			const res = await fetch(`${API_URL}/history/${user.id}`).then(r => r.json());
			setHistory(res.data || []);
		} catch {} finally { setLoading(false); }
	}, [user]);

	useEffect(() => { loadHistory(); }, [loadHistory]);

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={s.card}
			onPress={() => navigation.navigate("StoryDetail", { storyId: item.story_id })}
			activeOpacity={0.75}
		>
			<Image source={{ uri: item.thumbnail || DEFAULT_COVER }} style={s.cover} />
			<View style={s.info}>
				<Text style={s.title} numberOfLines={2}>{item.story_title}</Text>
				<Text style={s.meta}>{item.author_name}</Text>
				<View style={s.pill}>
					<MaterialIcons name="bookmark" size={12} color="#8B4513" />
					<Text style={s.pillText}>Chương {item.chapter_number}: {item.chapter_title}</Text>
				</View>
			</View>
			<View style={s.continueWrap}>
				<TouchableOpacity
					style={s.continueBtn}
					onPress={() => navigation.navigate("ChapterRead", { chapterId: item.chapter_id, storyId: item.story_id })}
				>
					<Text style={s.continueBtnText}>Đọc</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
					<MaterialIcons name="arrow-back" size={22} color="#1A1A1A" />
				</TouchableOpacity>
				<Text style={s.headerTitle}>Lịch sử đọc</Text>
			</View>

			{loading ? (
				<View style={s.center}><ActivityIndicator size="large" color="#8B4513" /></View>
			) : history.length === 0 ? (
				<View style={s.center}>
					<MaterialIcons name="history" size={52} color="#EBEBEB" />
					<Text style={s.emptyText}>Bạn chưa đọc truyện nào.</Text>
				</View>
			) : (
				<FlatList
					data={history}
					keyExtractor={(item, i) => `${item.chapter_id}-${i}`}
					renderItem={renderItem}
					contentContainerStyle={{ padding: 16, gap: 12 }}
					showsVerticalScrollIndicator={false}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadHistory(); setRefreshing(false); }} colors={["#8B4513"]} tintColor="#8B4513" />}
				/>
			)}
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#FFFFFF" },
	header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0", gap: 12 },
	backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F5F5F5", alignItems: "center", justifyContent: "center" },
	headerTitle: { fontSize: 20, fontWeight: "800", color: "#1A1A1A" },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#888888" },
	card: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#F0F0F0", padding: 12, alignItems: "center", gap: 12 },
	cover: { width: 60, height: 85, borderRadius: 8 },
	info: { flex: 1, gap: 4 },
	title: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", lineHeight: 20 },
	meta: { fontSize: 12, color: "#888888" },
	pill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F5F0EB", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: "flex-start" },
	pillText: { fontSize: 11, color: "#8B4513", fontWeight: "600" },
	continueWrap: { alignItems: "flex-end" },
	continueBtn: { backgroundColor: "#8B4513", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
	continueBtnText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
});

export default ReadingHistoryScreen;
