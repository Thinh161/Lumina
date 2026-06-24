import React, { useState, useEffect, useRef } from "react";
import {
	View, Text, TextInput, TouchableOpacity, FlatList,
	StyleSheet, SafeAreaView, Image, ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, searchStories } from "../../redux_thunk/StorySlice";

const DEFAULT_COVER = "https://lh3.googleusercontent.com/aida-public/AB6AXuD00yC-OnoCjJ9ZHaMrK26WR4nYqz0nk2iS7pDgV0ssTgw8yFCTDNtMUsY1PrTvNBcw6wSxrSiSTkZTqnqAffNyZ0UIKtGPXkVOT77r7Y5TCsZMjHWTTyxy49Hp18b4ugO9E7i3qYa1gH-kS7MEW9AsnlKK7f4oUBV50yuyj9NieHkFkbdHT8t6AlHwcNHmlOj9Ne21nhGlD1SZYbDdfw3l59bzcFB8gpWyHi_X8AT90teA3r5Xw3F45xnRt2FS-wrNbF-Kja0tdXc";

const PAGE_SIZE = 10;

const SearchScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { categories, searchResults, searchLoading } = useSelector(state => state.story);

	const [query, setQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [sortBy, setSortBy] = useState('newest');
	const [searched, setSearched] = useState(false);
	const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

	const debounceRef = useRef(null);

	useEffect(() => {
		dispatch(fetchCategories());
	}, [dispatch]);

	const doSearch = (searchQuery, catId, sort) => {
		setSearched(true);
		setDisplayCount(PAGE_SIZE);
		dispatch(searchStories({ query: searchQuery || '', categoryId: catId, sortBy: sort }));
	};

	const handleQueryChange = (text) => {
		setQuery(text);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		if (text.length > 0) {
			debounceRef.current = setTimeout(() => doSearch(text, selectedCategory, sortBy), 500);
		} else {
			setSearched(false);
		}
	};

	useEffect(() => {
		if (searched || selectedCategory !== null) doSearch(query, selectedCategory, sortBy);
	}, [selectedCategory, sortBy]);

	const displayed = searchResults.slice(0, displayCount);
	const hasMore = displayCount < searchResults.length;

	const renderStory = ({ item }) => (
		<TouchableOpacity
			style={styles.card}
			onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}
			activeOpacity={0.85}
		>
			<Image source={{ uri: item.cover_image || DEFAULT_COVER }} style={styles.cardCover} />
			<View style={styles.cardInfo}>
				<Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
				<Text style={styles.cardAuthor} numberOfLines={1}>
					<MaterialIcons name="person" size={12} color="#8B4513" /> {item.author_name || "Ẩn danh"}
				</Text>
				<View style={styles.cardMeta}>
					<View style={styles.categoryPill}>
						<Text style={styles.categoryPillText}>{item.category_names || "Khác"}</Text>
					</View>
					<Text style={styles.viewCount}>
						<MaterialIcons name="visibility" size={12} color="#BBBBBB" /> {item.views || 0}
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

			<View style={styles.searchBar}>
				<MaterialIcons name="search" size={20} color="#8B4513" style={{ marginRight: 8 }} />
				<TextInput
					style={styles.searchInput}
					placeholder="Tên truyện, tác giả..."
					placeholderTextColor="#BBBBBB"
					value={query}
					onChangeText={handleQueryChange}
					onSubmitEditing={() => doSearch(query, selectedCategory, sortBy)}
					returnKeyType="search"
				/>
				{query.length > 0 && (
					<TouchableOpacity onPress={() => { setQuery(''); setSearched(false); }}>
						<MaterialIcons name="close" size={18} color="#BBBBBB" />
					</TouchableOpacity>
				)}
			</View>

			<View style={styles.sortRow}>
				<MaterialIcons name="sort" size={14} color="#888888" />
				<TouchableOpacity
					style={[styles.sortChip, sortBy === 'newest' && styles.sortChipActive]}
					onPress={() => setSortBy('newest')}
				>
					<Text style={[styles.sortChipText, sortBy === 'newest' && styles.sortChipTextActive]}>Mới nhất</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.sortChip, sortBy === 'views' && styles.sortChipActive]}
					onPress={() => setSortBy('views')}
				>
					<Text style={[styles.sortChipText, sortBy === 'views' && styles.sortChipTextActive]}>Xem nhiều nhất</Text>
				</TouchableOpacity>
			</View>

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

			{searchLoading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color="#8B4513" />
				</View>
			) : searched && searchResults.length === 0 ? (
				<View style={styles.center}>
					<MaterialIcons name="search-off" size={48} color="#DDDDDD" />
					<Text style={styles.emptyText}>Không tìm thấy truyện nào.</Text>
				</View>
			) : !searched ? (
				<View style={styles.center}>
					<MaterialIcons name="auto-stories" size={52} color="#DDDDDD" />
					<Text style={styles.emptyText}>Nhập tên truyện hoặc chọn thể loại để tìm.</Text>
				</View>
			) : (
				<FlatList
					data={displayed}
					keyExtractor={item => String(item.id)}
					renderItem={renderStory}
					contentContainerStyle={styles.list}
					showsVerticalScrollIndicator={false}
					ListFooterComponent={hasMore ? (
						<TouchableOpacity style={styles.loadMoreBtn} onPress={() => setDisplayCount(prev => prev + PAGE_SIZE)}>
							<Text style={styles.loadMoreText}>Xem thêm ({searchResults.length - displayCount} kết quả)</Text>
							<MaterialIcons name="expand-more" size={18} color="#8B4513" />
						</TouchableOpacity>
					) : null}
				/>
			)}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
	header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
	headerTitle: { fontSize: 22, fontWeight: "800", color: "#1A1A1A" },
	searchBar: {
		flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5",
		marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 10,
		borderRadius: 12, borderWidth: 1, borderColor: "#EBEBEB",
	},
	searchInput: { flex: 1, fontSize: 14, color: "#1A1A1A" },
	chipRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
	chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#EBEBEB", backgroundColor: "#F5F5F5" },
	chipActive: { backgroundColor: "#8B4513", borderColor: "#8B4513" },
	chipText: { fontSize: 12, color: "#888888", fontWeight: "600" },
	chipTextActive: { color: "#FFFFFF" },
	center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
	emptyText: { fontSize: 14, color: "#888888", textAlign: "center", paddingHorizontal: 32 },
	list: { paddingHorizontal: 16, paddingBottom: 24 },
	card: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 12, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "#F0F0F0" },
	cardCover: { width: 80, height: 110 },
	cardInfo: { flex: 1, padding: 12, justifyContent: "space-between" },
	cardTitle: { fontSize: 14, fontWeight: "700", color: "#1A1A1A", lineHeight: 20 },
	cardAuthor: { fontSize: 12, color: "#8B4513", marginTop: 2 },
	cardMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
	categoryPill: { backgroundColor: "#F2E8E3", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
	categoryPillText: { fontSize: 10, color: "#8B4513", fontWeight: "600" },
	viewCount: { fontSize: 11, color: "#BBBBBB" },
	cardDesc: { fontSize: 11, color: "#888888", lineHeight: 16, marginTop: 4 },
	loadMoreBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: "#EBEBEB", backgroundColor: "#F5F5F5", marginTop: 4, marginBottom: 8 },
	loadMoreText: { fontSize: 13, fontWeight: "700", color: "#8B4513" },
	sortRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, gap: 8, marginBottom: 8 },
	sortChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "#EBEBEB", backgroundColor: "#F5F5F5" },
	sortChipActive: { backgroundColor: "#F2E8E3", borderColor: "#8B4513" },
	sortChipText: { fontSize: 12, color: "#888888", fontWeight: "600" },
	sortChipTextActive: { color: "#8B4513" },
});

export default SearchScreen;
