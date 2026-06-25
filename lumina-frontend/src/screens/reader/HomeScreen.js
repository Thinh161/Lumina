import React, { useEffect, useState, useCallback } from "react";
import {
	View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
	ScrollView, Image, ActivityIndicator, Alert, RefreshControl
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories, fetchCategories, fetchLatestStories, fetchTopStories, fetchStoryDetails, fetchChapters } from "../../redux_thunk/StorySlice";
import { fetchReadingHistory } from "../../redux_thunk/UserSlice";

const DEFAULT_IMG = "https://lh3.googleusercontent.com/aida-public/AB6AXuD00yC-OnoCjJ9ZHaMrK26WR4nYqz0nk2iS7pDgV0ssTgw8yFCTDNtMUsY1PrTvNBcw6wSxrSiSTkZTqnqAffNyZ0UIKtGPXkVOT77r7Y5TCsZMjHWTTyxy49Hp18b4ugO9E7i3qYa1gH-kS7MEW9AsnlKK7f4oUBV50yuyj9NieHkFkbdHT8t6AlHwcNHmlOj9Ne21nhGlD1SZYbDdfw3l59bzcFB8gpWyHi_X8AT90teA3r5Xw3F45xnRt2FS-wrNbF-Kja0tdXc";

const PAGE_SIZE = 10;

const HomeScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const { stories, categories, latestStories, topStories, loading } = useSelector(s => s.story);
	const { user } = useSelector(s => s.auth);
	const { history } = useSelector(s => s.user);
	const [selectedCat, setSelectedCat] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

	const continueReading = history[0] || null;

	const loadData = useCallback(() => {
		dispatch(fetchStories());
		dispatch(fetchCategories());
		dispatch(fetchLatestStories());
		dispatch(fetchTopStories());
		if (user?.id) dispatch(fetchReadingHistory(user.id));
	}, [dispatch, user?.id]);

	useEffect(() => { loadData(); }, [loadData]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		setDisplayCount(PAGE_SIZE);
		await Promise.all([
			dispatch(fetchStories()),
			dispatch(fetchCategories()),
			dispatch(fetchLatestStories()),
			dispatch(fetchTopStories()),
			user?.id ? dispatch(fetchReadingHistory(user.id)) : Promise.resolve(),
		]);
		setRefreshing(false);
	}, [dispatch, user?.id]);

	const handleReadNow = async (storyId) => {
		try {
			const [, chapters] = await Promise.all([
				dispatch(fetchStoryDetails(storyId)).unwrap(),
				dispatch(fetchChapters(storyId)).unwrap(),
			]);
			const first = [...(chapters || [])].sort((a, b) => a.chapter_number - b.chapter_number)[0];
			if (!first) { Alert.alert("Thông báo", "Truyện chưa có chương."); return; }
			navigation.navigate("ChapterRead", { chapterId: first.id, storyId });
		} catch { Alert.alert("Lỗi", "Không thể mở chương."); }
	};

	const filtered = selectedCat ? stories.filter(s => s.category_ids?.split(',').map(Number).includes(selectedCat)) : stories;
	const displayed = filtered.slice(0, displayCount);
	const hasMore = displayCount < filtered.length;

	if (loading && stories.length === 0) {
		return <SafeAreaView style={s.safe}><ActivityIndicator size="large" color="#8B4513" style={{ flex: 1 }} /></SafeAreaView>;
	}

	return (
		<SafeAreaView style={s.safe}>
			<View style={s.header}>
				<View>
					<Text style={s.greeting}>Chào, {user?.full_name || user?.username} 👋</Text>
					<Text style={s.sub}>Hôm nay đọc gì?</Text>
				</View>
				<TouchableOpacity style={s.searchBtn} onPress={() => navigation.navigate("SearchTab")}>
					<MaterialIcons name="search" size={22} color="#1A1A1A" />
				</TouchableOpacity>
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={s.scroll}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#8B4513"]} tintColor="#8B4513" />}
			>
				{continueReading && (
					<TouchableOpacity
						style={s.continueCard}
						onPress={() => navigation.navigate("ChapterRead", { chapterId: continueReading.chapter_id, storyId: continueReading.story_id })}
						activeOpacity={0.85}
					>
						<Image source={{ uri: continueReading.cover_image || DEFAULT_IMG }} style={s.continueCover} />
						<View style={s.continueInfo}>
							<Text style={s.continueMeta}>TIẾP TỤC ĐỌC</Text>
							<Text style={s.continueTitle} numberOfLines={1}>{continueReading.story_title}</Text>
							<Text style={s.continueChap} numberOfLines={1}>
								Chương {continueReading.chapter_number}: {continueReading.chapter_title}
							</Text>
						</View>
						<MaterialIcons name="play-circle-filled" size={32} color="#8B4513" />
					</TouchableOpacity>
				)}

				<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
					<TouchableOpacity style={[s.chip, !selectedCat && s.chipActive]} onPress={() => { setSelectedCat(null); setDisplayCount(PAGE_SIZE); }}>
						<Text style={[s.chipText, !selectedCat && s.chipTextActive]}>Tất cả</Text>
					</TouchableOpacity>
					{categories.map(c => (
						<TouchableOpacity key={c.id} style={[s.chip, selectedCat === c.id && s.chipActive]} onPress={() => { setSelectedCat(selectedCat === c.id ? null : c.id); setDisplayCount(PAGE_SIZE); }}>
							<Text style={[s.chipText, selectedCat === c.id && s.chipTextActive]}>{c.name}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>

				{filtered[0] && (
					<TouchableOpacity style={s.featured} onPress={() => navigation.navigate("StoryDetail", { storyId: filtered[0].id })} activeOpacity={0.9}>
						<Image source={{ uri: filtered[0].cover_image || DEFAULT_IMG }} style={s.featuredImg} />
						<View style={s.featuredInfo}>
							<View style={s.catTag}><Text style={s.catTagText}>{filtered[0].category_names}</Text></View>
							<Text style={s.featuredTitle} numberOfLines={2}>{filtered[0].title}</Text>
							<Text style={s.featuredAuthor}>{filtered[0].author_name}</Text>
							<TouchableOpacity style={s.readBtn} onPress={() => handleReadNow(filtered[0].id)}>
								<MaterialIcons name="menu-book" size={15} color="#fff" />
								<Text style={s.readBtnText}>Đọc ngay</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				)}

				{latestStories.length > 0 && (
					<>
						<View style={s.sectionHeader}><Text style={s.sectionTitle}>Mới nhất</Text></View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hList}>
							{latestStories.map(story => (
								<TouchableOpacity key={story.id} style={s.hCard} onPress={() => navigation.navigate("StoryDetail", { storyId: story.id })} activeOpacity={0.85}>
									<Image source={{ uri: story.cover_image || DEFAULT_IMG }} style={s.hCover} />
									<Text style={s.hTitle} numberOfLines={2}>{story.title}</Text>
									<Text style={s.hAuthor} numberOfLines={1}>{story.author_name}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</>
				)}

				{topStories.length > 0 && (
					<>
						<View style={s.sectionHeader}><Text style={s.sectionTitle}>Xem nhiều nhất</Text></View>
						<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.hList}>
							{topStories.map(story => (
								<TouchableOpacity key={story.id} style={s.hCard} onPress={() => navigation.navigate("StoryDetail", { storyId: story.id })} activeOpacity={0.85}>
									<Image source={{ uri: story.cover_image || DEFAULT_IMG }} style={s.hCover} />
									<Text style={s.hTitle} numberOfLines={2}>{story.title}</Text>
									<View style={s.hViews}><MaterialIcons name="visibility" size={10} color="#8B4513" /><Text style={s.hViewText}>{story.views || 0}</Text></View>
								</TouchableOpacity>
							))}
						</ScrollView>
					</>
				)}

				<View style={s.sectionHeader}>
					<Text style={s.sectionTitle}>Tất cả truyện</Text>
					<Text style={s.sectionCount}>{filtered.length} truyện</Text>
				</View>

				{displayed.map(story => (
					<TouchableOpacity key={story.id} style={s.card} onPress={() => navigation.navigate("StoryDetail", { storyId: story.id })} activeOpacity={0.85}>
						<Image source={{ uri: story.cover_image || DEFAULT_IMG }} style={s.cardImg} />
						<View style={s.cardInfo}>
							<Text style={s.cardTitle} numberOfLines={2}>{story.title}</Text>
							<Text style={s.cardAuthor} numberOfLines={1}>{story.author_name}</Text>
							<View style={s.cardMeta}>
								<View style={s.catPill}><Text style={s.catPillText}>{story.category_names}</Text></View>
								<Text style={s.views}><MaterialIcons name="visibility" size={11} color="#BBBBBB" /> {story.views || 0}</Text>
							</View>
							<Text style={s.cardDesc} numberOfLines={2}>{story.description}</Text>
						</View>
					</TouchableOpacity>
				))}

				{hasMore && (
					<TouchableOpacity style={s.loadMoreBtn} onPress={() => setDisplayCount(prev => prev + PAGE_SIZE)}>
						<Text style={s.loadMoreText}>Xem thêm ({filtered.length - displayCount} truyện)</Text>
						<MaterialIcons name="expand-more" size={18} color="#8B4513" />
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	);
};

const s = StyleSheet.create({
	safe: { flex: 1, backgroundColor: '#FFFFFF' },
	header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
	greeting: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
	sub: { fontSize: 12, color: '#888888', marginTop: 1 },
	searchBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
	scroll: { paddingBottom: 24 },
	continueCard: { marginHorizontal: 16, marginTop: 14, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F2E8E3', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#EBEBEB' },
	continueCover: { width: 50, height: 70, borderRadius: 8 },
	continueInfo: { flex: 1 },
	continueMeta: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: '#8B4513', textTransform: 'uppercase' },
	continueTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginTop: 3 },
	continueChap: { fontSize: 12, color: '#888888', marginTop: 2 },
	chips: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
	chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: '#F5F5F5' },
	chipActive: { backgroundColor: '#8B4513' },
	chipText: { fontSize: 13, color: '#888888', fontWeight: '600' },
	chipTextActive: { color: '#FFFFFF' },
	featured: { marginHorizontal: 16, marginBottom: 16, flexDirection: 'row', backgroundColor: '#FAFAFA', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#EBEBEB' },
	featuredImg: { width: 120, height: 160 },
	featuredInfo: { flex: 1, padding: 14, justifyContent: 'space-between' },
	catTag: { alignSelf: 'flex-start', backgroundColor: '#F2E8E3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
	catTagText: { fontSize: 11, color: '#8B4513', fontWeight: '700' },
	featuredTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A1A', lineHeight: 21 },
	featuredAuthor: { fontSize: 12, color: '#888888' },
	readBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#8B4513', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' },
	readBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
	sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
	sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
	sectionCount: { fontSize: 12, color: '#888888' },
	card: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden' },
	cardImg: { width: 80, height: 110 },
	cardInfo: { flex: 1, padding: 12 },
	cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', lineHeight: 20 },
	cardAuthor: { fontSize: 12, color: '#8B4513', marginTop: 2 },
	cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
	catPill: { backgroundColor: '#F2E8E3', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
	catPillText: { fontSize: 10, color: '#8B4513', fontWeight: '600' },
	views: { fontSize: 11, color: '#BBBBBB' },
	cardDesc: { fontSize: 11, color: '#888888', lineHeight: 16, marginTop: 4 },
	loadMoreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginHorizontal: 16, marginTop: 8, marginBottom: 8, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EBEBEB', backgroundColor: '#F5F5F5' },
	loadMoreText: { fontSize: 13, fontWeight: '700', color: '#8B4513' },
	hList: { paddingHorizontal: 16, paddingBottom: 12, gap: 10 },
	hCard: { width: 110, gap: 4 },
	hCover: { width: 110, height: 150, borderRadius: 10 },
	hTitle: { fontSize: 12, fontWeight: '700', color: '#1A1A1A', lineHeight: 16 },
	hAuthor: { fontSize: 11, color: '#8B4513' },
	hViews: { flexDirection: 'row', alignItems: 'center', gap: 3 },
	hViewText: { fontSize: 10, color: '#8B4513', fontWeight: '600' },
});

export default HomeScreen;
