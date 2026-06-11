import React, { useState, useEffect, useCallback } from "react";
import {
	View, Text, TextInput, TouchableOpacity, FlatList,
	StyleSheet, SafeAreaView, Image, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux_thunk/StorySlice";

const API_URL = 'http://10.106.42.58:5555/api';
const DEFAULT_COVER = "https://lh3.googleusercontent.com/aida-public/AB6AXuD00yC-OnoCjJ9ZHaMrK26WR4nYqz0nk2iS7pDgV0ssTgw8yFCTDNtMUsY1PrTvNBcw6wSxrSiSTkZTqnqAffNyZ0UIKtGPXkVOT77r7Y5TCsZMjHWTTyxy49Hp18b4ugO9E7i3qYa1gH-kS7MEW9AsnlKK7f4oUBV50yuyj9NieHkFkbdHT8t6AlHwcNHmlOj9Ne21nhGlD1SZYbDdfw3l59bzcFB8gpWyHi_X8AT90teA3r5Xw3F45xnRt2FS-wrNbF-Kja0tdXc";

const SearchScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { categories } = useSelector(state => state.story);

	const [query, setQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searched, setSearched] = useState(false);

	useEffect(() => {
		dispatch(fetchCategories());
	}, [dispatch]);

	const doSearch = useCallback(async () => {
		setLoading(true);
		setSearched(true);
		try {
			let url = `${API_URL}/stories/search?q=${encodeURIComponent(query)}`;
			if (selectedCategory) url += `&category_id=${selectedCategory}`;
			const data = await fetch(url).then(r => r.json());
			setResults(data.status === "success" ? data.data : []);
		} catch {
			setResults([]);
		} finally {
			setLoading(false);
		}
	}, [query, selectedCategory]);

	// Tự động search khi chọn thể loại
	useEffect(() => {
		if (selectedCategory !== null) doSearch();
	}, [selectedCategory]);

	const renderStory = ({ item }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}
			activeOpacity={0.85}
		>
			<Image
				source={{ uri: item.cover_image || DEFAULT_COVER }}
				style={styles.cardCover}
			/>
			<View style={styles.cardInfo}>
				<Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
				<Text style={styles.cardAuthor} numberOfLines={1}>
					<MaterialIcons name="person" size={12} color="#8c4f3b" /> {item.author_name || "Ẩn danh"}
				</Text>
				<View style={styles.cardMeta}>
					<View style={styles.categoryPill}>
						<Text style={styles.categoryPillText}>{item.category_name || "Khác"}</Text>
					</View>
					<Text style={styles.viewCount}>
						<MaterialIcons name="visibility" size={12} color="#b3b2af" /> {item.views || 0}
					</Text>
				</View>
				<Text style={styles.cardDesc} numberOfLines={2}>{item.description || "Chưa có mô tả."}</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Tìm Kiếm</Text>
			</View>

			{/* Search bar */}
			<View style={styles.searchBar}>
				<MaterialIcons name="search" size={20} color="#8c4f3b" style={{ marginRight: 8 }} />
				<TextInput
					style={styles.searchInput}
					placeholder="Tên truyện, tác giả..."
					placeholderTextColor="#b3b2af"
					value={query}
					onChangeText={setQuery}
					onSubmitEditing={doSearch}
					returnKeyType="search"
				/>
				{query.length > 0 && (
					<TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
						<MaterialIcons name="close" size={18} color="#b3b2af" />
					</TouchableOpacity>
				)}
			</View>

			{/* Category filter chips */}
			<View style={styles.chipRow}>
				<TouchableOpacity
					style={[styles.chip, !selectedCategory && styles.chipActive]}
					onPress={() => setSelectedCategory(null)}
				>
					<Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>Tất cả</Text>
				</TouchableOpacity>
				{categories.map(cat => (
					<TouchableOpacity
						key={cat.id}
						style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
						onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
					>
						<Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
							{cat.name}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Results */}
			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#dca77c" />
				</View>
			) : searched && results.length === 0 ? (
				<View style={styles.center}>
					<MaterialIcons name="search-off" size={48} color="#dca77c" />
					<Text style={styles.emptyText}>Không tìm thấy truyện nào.</Text>
				</View>
			) : !searched ? (
				<View style={styles.center}>
					<MaterialIcons name="auto-stories" size={52} color="#dca77c" />
					<Text style={styles.emptyText}>Nhập tên truyện hoặc chọn thể loại để tìm.</Text>
				</View>
			) : (
				<FlatList
					data={results}
					keyExtractor={item => String(item.id)}
					renderItem={renderStory}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#fcf9f7" },
	header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
	headerTitle: { fontSize: 22, fontWeight: "800", color: "#323331", letterSpacing: 0.5 },

	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		marginHorizontal: 16,
		marginBottom: 12,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "rgba(179,178,175,0.3)",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	searchInput: { flex: 1, fontSize: 14, color: "#323331" },

	chipRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 16,
		gap: 8,
		marginBottom: 12,
	},
	chip: {
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "rgba(140,79,59,0.3)",
		backgroundColor: "#fff",
	},
	chipActive: { backgroundColor: "#8c4f3b", borderColor: "#8c4f3b" },
	chipText: { fontSize: 12, color: "#8c4f3b", fontWeight: "600" },
	chipTextActive: { color: "#fff" },

	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#8c4f3b", textAlign: "center", paddingHorizontal: 32 },

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
	cardCover: { width: 80, height: 110 },
	cardInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
	cardTitle: { fontSize: 14, fontWeight: "700", color: "#323331", lineHeight: 20 },
	cardAuthor: { fontSize: 12, color: "#8c4f3b", marginTop: 2 },
	cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
	categoryPill: {
		backgroundColor: "rgba(140,79,59,0.1)",
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 999,
	},
	categoryPillText: { fontSize: 10, color: "#8c4f3b", fontWeight: "600" },
	viewCount: { fontSize: 11, color: "#b3b2af" },
	cardDesc: { fontSize: 11, color: "#5f5f5d", lineHeight: 16, marginTop: 4 },
});

export default SearchScreen;
