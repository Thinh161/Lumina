import React, { useEffect } from "react";
import {
	View, Text, FlatList, TouchableOpacity, Image,
	StyleSheet, SafeAreaView, ActivityIndicator, Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchLibrary, removeFromLibrary } from "../../redux_thunk/LibrarySlice";

const DEFAULT_COVER = "https://lh3.googleusercontent.com/aida-public/AB6AXuD00yC-OnoCjJ9ZHaMrK26WR4nYqz0nk2iS7pDgV0ssTgw8yFCTDNtMUsY1PrTvNBcw6wSxrSiSTkZTqnqAffNyZ0UIKtGPXkVOT77r7Y5TCsZMjHWTTyxy49Hp18b4ugO9E7i3qYa1gH-kS7MEW9AsnlKK7f4oUBV50yuyj9NieHkFkbdHT8t6AlHwcNHmlOj9Ne21nhGlD1SZYbDdfw3l59bzcFB8gpWyHi_X8AT90teA3r5Xw3F45xnRt2FS-wrNbF-Kja0tdXc";

const LibraryScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { user } = useSelector(state => state.auth);
	const { items, loading } = useSelector(state => state.library);

	useEffect(() => {
		if (user?.id) dispatch(fetchLibrary(user.id));
	}, [dispatch, user]);

	const handleRemove = (storyId, title) => {
		Alert.alert(
			"Xóa khỏi thư viện",
			`Bỏ "${title}" khỏi thư viện?`,
			[
				{ text: "Hủy", style: "cancel" },
				{
					text: "Xóa",
					style: "destructive",
					onPress: () => dispatch(removeFromLibrary({ user_id: user.id, story_id: storyId })),
				},
			]
		);
	};

	const renderItem = ({ item }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}
			activeOpacity={0.85}
		>
			<Image source={{ uri: item.cover_image || DEFAULT_COVER }} style={styles.cover} />
			<View style={styles.info}>
				<Text style={styles.title} numberOfLines={2}>{item.title}</Text>
				<Text style={styles.author} numberOfLines={1}>
					{item.author_name || "Ẩn danh"}
				</Text>
				<View style={styles.categoryPill}>
					<Text style={styles.categoryText}>{item.category_name || "Khác"}</Text>
				</View>
				<Text style={styles.addedAt}>
					Đã lưu: {new Date(item.added_at).toLocaleDateString("vi-VN")}
				</Text>
			</View>
			<TouchableOpacity
				style={styles.removeBtn}
				onPress={() => handleRemove(item.id, item.title)}
			>
				<MaterialIcons name="bookmark-remove" size={22} color="#8c4f3b" />
			</TouchableOpacity>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Thư Viện</Text>
				<Text style={styles.headerSub}>{items.length} truyện đã lưu</Text>
			</View>

			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#dca77c" />
				</View>
			) : items.length === 0 ? (
				<View style={styles.center}>
					<MaterialIcons name="auto-stories" size={56} color="#dca77c" />
					<Text style={styles.emptyTitle}>Thư viện trống</Text>
					<Text style={styles.emptyDesc}>Thêm truyện bạn yêu thích vào đây để đọc sau.</Text>
					<TouchableOpacity
						style={styles.browseBtn}
						onPress={() => navigation.navigate("Home")}
					>
						<Text style={styles.browseBtnText}>Khám phá truyện</Text>
					</TouchableOpacity>
				</View>
			) : (
				<FlatList
					data={items}
					keyExtractor={item => String(item.id)}
					renderItem={renderItem}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#fcf9f7" },
	header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
	headerTitle: { fontSize: 22, fontWeight: "800", color: "#323331" },
	headerSub: { fontSize: 12, color: "#8c4f3b", marginTop: 2 },

	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyTitle: { fontSize: 16, fontWeight: "700", color: "#323331" },
	emptyDesc: { fontSize: 13, color: "#5f5f5d", textAlign: "center", paddingHorizontal: 40 },
	browseBtn: {
		marginTop: 8,
		backgroundColor: "#8c4f3b",
		paddingHorizontal: 24,
		paddingVertical: 10,
		borderRadius: 999,
	},
	browseBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

	list: { paddingHorizontal: 16, paddingBottom: 24 },
	card: {
		flexDirection: "row",
		backgroundColor: "#fff",
		borderRadius: 12,
		marginBottom: 12,
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "rgba(179,178,175,0.2)",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	cover: { width: 80, height: 110 },
	info: { flex: 1, padding: 12, justifyContent: "space-between" },
	title: { fontSize: 14, fontWeight: "700", color: "#323331", lineHeight: 20 },
	author: { fontSize: 12, color: "#8c4f3b", marginTop: 2 },
	categoryPill: {
		alignSelf: "flex-start",
		backgroundColor: "rgba(140,79,59,0.1)",
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 999,
		marginTop: 4,
	},
	categoryText: { fontSize: 10, color: "#8c4f3b", fontWeight: "600" },
	addedAt: { fontSize: 10, color: "#b3b2af", marginTop: 4 },
	removeBtn: { padding: 12, justifyContent: "center" },
});

export default LibraryScreen;
