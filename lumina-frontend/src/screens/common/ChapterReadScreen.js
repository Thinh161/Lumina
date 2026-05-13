import React from "react";
import {
	View,
	Text,
	StyleSheet,
	SafeAreaView,
	ScrollView,
	Image,
	TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const ChapterReadScreen = ({ navigation }) => {
	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.root}>
				<View style={styles.topBar}>
					<TouchableOpacity
						style={styles.iconButton}
						onPress={() => navigation.goBack()}
					>
						<MaterialIcons name="arrow-back" size={20} color="#5f5f5d" />
					</TouchableOpacity>

					<View style={styles.toolbarGroup}>
						<TouchableOpacity style={styles.toolbarIcon}>
							<MaterialIcons name="format-size" size={18} color="#5f5f5d" />
						</TouchableOpacity>
						<View style={styles.toolbarDivider} />
						<View style={styles.paletteRow}>
							<View style={[styles.paletteDot, styles.paletteLight]} />
							<View style={[styles.paletteDot, styles.paletteSepia]} />
							<View style={[styles.paletteDot, styles.paletteDark]} />
						</View>
					</View>
				</View>

				<ScrollView
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.canvas}>
						<View style={styles.chapterHeader}>
							<Text style={styles.chapterMeta}>Chương XII</Text>
							<Text style={styles.chapterTitle}>
								Tiếng Gọi Từ Những Đồi Cát Trắng
							</Text>
							<View style={styles.chapterStats}>
								<Text style={styles.chapterStat}>12 phút đọc</Text>
								<View style={styles.dot} />
								<Text style={styles.chapterStat}>2,450 từ</Text>
							</View>
						</View>

						<View style={styles.heroImageWrap}>
							<Image
								source={{
									uri:
										"https://lh3.googleusercontent.com/aida-public/AB6AXuCtiBYWyajoVu9-s838WL7kT9bkXHOP_UmUYP7YG3Y2ELYpuAYyoJogakaVcO0Mr8mJh0yBSD3lEYTsq9wOb9Bc78lsfqbZ2SoH1xLn3PEx8u0EHD72U8bmQXgLdvQqQzJfxe2j5I_BqLst0X2d3_rBIlXUW6rfff7jDQiX_QNd5nHH2MXZnNBsOjvvQaeZq0sSYPa1xfcm2INyXY7LhtXnta_GUbhiLYyC_s6UQ9BO3lDbY2vWrXUWLVcCaBUdvQSe_HMSO0kBxTI",
								}}
								style={styles.heroImage}
							/>
							<View style={styles.heroOverlay} />
						</View>

						<View style={styles.article}>
							<View style={styles.dropCapRow}>
								<Text style={styles.dropCap}>G</Text>
								<Text style={styles.paragraphFirst}>
									ió bắt đầu thổi từ hướng Tây Bắc khi mặt trời bắt đầu chìm khuất sau
									những rặng núi xa xăm. Cái nắng gay gắt của ban ngày nhường chỗ cho
									một sự tĩnh lặng đến lạ kỳ, chỉ còn lại tiếng rầm rì của cát bay lướt
									qua những bụi xương rồng khô héo. Anna đứng đó, đôi mắt nheo lại vì
									những hạt bụi nhỏ, cảm nhận hơi lạnh đang dần thấm vào làn da.
								</Text>
							</View>

							<Text style={styles.paragraph}>
								Nàng đã đi bộ gần ba tiếng đồng hồ kể từ khi chiếc xe jeep cũ kỹ ấy
								quyết định "nghỉ hưu" ngay giữa lòng sa mạc. Không có bản đồ, không có
								tín hiệu điện thoại, chỉ có niềm tin mong manh vào những câu chuyện mà
								ông nội thường kể về ngôi làng bị lãng quên nằm đâu đó sau những đồi cát
								trắng xóa này.
							</Text>

							<View style={styles.quoteBlock}>
								<Text style={styles.quoteText}>
									"Đừng bao giờ tin vào những gì đôi mắt thấy giữa sa mạc, hãy tin vào
									những gì trái tim nghe thấy được trong tiếng gió."
								</Text>
							</View>

							<Text style={styles.paragraph}>
								Câu nói ấy vang vọng trong đầu nàng như một lời nhắc nhở. Nàng hít một
								hơi thật sâu, vị cát mằn mặn và khô khốc tràn ngập trong lồng ngực. Ánh
								sáng tím nhạt của hoàng hôn đang vẽ nên những hình thù kỳ dị lên mặt đất
								phẳng lặng. Anna nhận ra mình không còn sợ hãi nữa. Có một điều gì đó
								đang chờ đợi nàng, một bí mật đã bị chôn vùi qua bao thế kỷ, giờ đây
								đang trỗi dậy theo từng nhịp bước chân.
							</Text>

							<Text style={styles.paragraph}>
								Đột nhiên, từ phía sau một đụn cát cao sừng sững, một tia sáng bạc lóe
								lên. Nó không phải là ánh sáng phản chiếu của mặt trời, mà là một thứ
								ánh sáng tự thân, dịu dàng và đầy mê hoặc. Anna bước nhanh hơn, đôi chân
								vùi sâu trong lớp cát mịn màng. Khi lên đến đỉnh đồi, hơi thở nàng như
								ngừng lại.
							</Text>

							<View style={styles.splitRow}>
								<View style={styles.splitText}>
									<Text style={styles.paragraph}>
										Dưới thung lũng nhỏ được bao bọc bởi những bức tường cát trắng là
										một ốc đảo rực rỡ. Nhưng đó không phải là ốc đảo với nước và cây
										xanh thông thường. Những ngôi nhà ở đây được xây dựng bằng một loại
										đá trong suốt như pha lê, tỏa ra ánh sáng dịu nhẹ bao trùm toàn bộ
										không gian.
									</Text>
								</View>
								<View style={styles.splitImageWrap}>
									<Image
										source={{
											uri:
												"https://lh3.googleusercontent.com/aida-public/AB6AXuBD61U6yDYiWG07HsQq6WDjqSpIPMZ7P4bJL4SdFzpjGlv2CJQVFjktIkZdqddtoXlJWaGk0C0ghzGHZByprnzFAZ7PGR5I3B8RjuxmcVDojqaxlaXU8zz89-HVVAHbum0jyMfEkOoWEo8MfuzKRSQzcBGeQa_udQ5QjyW88E9QJPKyOfP5JuhStknYKAZUDw7WXNpums6NsKHnAMToAa7pz4qtGmg2qHq7NJW3F3Lh3unMpqseo6fFBcl4fNfTKArx0EEE1PKpj3I",
										}}
										style={styles.splitImage}
									/>
								</View>
							</View>

							<Text style={styles.paragraph}>
								Không có một tiếng động nào phát ra từ ngôi làng pha lê ấy. Nó giống như
								một giấc mơ bị đóng băng trong thời gian. Anna bắt đầu bước xuống dốc,
								cảm giác như mình đang bước vào một thế giới khác, nơi mà thực tại và
								huyền ảo hòa làm một. Mỗi bước chân của nàng giờ đây không còn nặng nề,
								mà nhẹ bẫng như thể nàng đang lướt đi trên mây.
							</Text>

							<Text style={styles.paragraph}>
								Nàng đã tìm thấy nó. Ngôi làng của những Người Giữ Giấc Mơ. Và từ đây,
								cuộc hành trình thực sự của nàng mới chính thức bắt đầu.
							</Text>
						</View>

						<View style={styles.chapterFooter}>
							<TouchableOpacity style={styles.nextChapterButton}>
								<Text style={styles.nextLabel}>Chương kế tiếp</Text>
								<Text style={styles.nextTitle}>XIII. Ánh Sáng Pha Lê</Text>
								<View style={styles.nextIconWrap}>
									<MaterialIcons
										name="keyboard-arrow-down"
										size={24}
										color="#8c4f3b"
									/>
								</View>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>

				<View style={styles.progressBar}>
					<Text style={styles.progressLabel}>45%</Text>
					<View style={styles.progressTrack}>
						<View style={styles.progressFill} />
					</View>
					<View style={styles.progressActions}>
						<TouchableOpacity>
							<MaterialIcons name="bookmark" size={20} color="#5f5f5d" />
						</TouchableOpacity>
						<TouchableOpacity>
							<MaterialIcons name="list-alt" size={20} color="#5f5f5d" />
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "#fcf9f7",
	},
	root: {
		flex: 1,
	},
	topBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 8,
	},
	iconButton: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "rgba(246, 243, 241, 0.85)",
		alignItems: "center",
		justifyContent: "center",
	},
	toolbarGroup: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(246, 243, 241, 0.85)",
	},
	toolbarIcon: {
		padding: 4,
	},
	toolbarDivider: {
		width: 1,
		height: 16,
		backgroundColor: "rgba(179, 178, 175, 0.4)",
		marginHorizontal: 8,
	},
	paletteRow: {
		flexDirection: "row",
		gap: 6,
	},
	paletteDot: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.4)",
	},
	paletteLight: {
		backgroundColor: "#fcf9f7",
	},
	paletteSepia: {
		backgroundColor: "#f4ebd0",
	},
	paletteDark: {
		backgroundColor: "#323331",
	},
	scrollContent: {
		paddingTop: 72,
		paddingBottom: 120,
	},
	canvas: {
		width: "100%",
		maxWidth: 720,
		alignSelf: "center",
		paddingHorizontal: 20,
	},
	chapterHeader: {
		alignItems: "center",
		marginBottom: 24,
	},
	chapterMeta: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 3,
		textTransform: "uppercase",
		color: "#8c4f3b",
		marginBottom: 12,
	},
	chapterTitle: {
		fontSize: 28,
		fontWeight: "700",
		fontStyle: "italic",
		textAlign: "center",
		color: "#323331",
		marginBottom: 12,
	},
	chapterStats: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	chapterStat: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	dot: {
		width: 4,
		height: 4,
		borderRadius: 2,
		backgroundColor: "#b3b2af",
	},
	heroImageWrap: {
		borderRadius: 16,
		overflow: "hidden",
		marginBottom: 24,
		backgroundColor: "#f6f3f1",
	},
	heroImage: {
		width: "100%",
		height: 200,
	},
	heroOverlay: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: "rgba(252, 249, 247, 0.12)",
	},
	article: {
		gap: 18,
	},
	dropCapRow: {
		flexDirection: "row",
		gap: 8,
	},
	dropCap: {
		fontSize: 46,
		fontWeight: "700",
		color: "#8c4f3b",
		lineHeight: 52,
	},
	paragraphFirst: {
		flex: 1,
		fontSize: 16,
		lineHeight: 26,
		color: "#3f403e",
	},
	paragraph: {
		fontSize: 16,
		lineHeight: 26,
		color: "#3f403e",
	},
	quoteBlock: {
		padding: 16,
		borderLeftWidth: 2,
		borderLeftColor: "rgba(140, 79, 59, 0.3)",
		backgroundColor: "rgba(246, 243, 241, 0.6)",
		borderRadius: 12,
	},
	quoteText: {
		fontSize: 18,
		fontStyle: "italic",
		color: "#5f5f5d",
		lineHeight: 26,
	},
	splitRow: {
		gap: 16,
	},
	splitText: {
		flex: 1,
	},
	splitImageWrap: {
		alignSelf: "center",
		width: "70%",
		borderRadius: 16,
		overflow: "hidden",
	},
	splitImage: {
		width: "100%",
		height: 220,
	},
	chapterFooter: {
		marginTop: 24,
		alignItems: "center",
	},
	nextChapterButton: {
		alignItems: "center",
		gap: 8,
	},
	nextLabel: {
		fontSize: 10,
		fontWeight: "700",
		letterSpacing: 2,
		textTransform: "uppercase",
		color: "#5f5f5d",
	},
	nextTitle: {
		fontSize: 20,
		fontWeight: "700",
		fontStyle: "italic",
		color: "#323331",
		textAlign: "center",
	},
	nextIconWrap: {
		width: 44,
		height: 44,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.4)",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 4,
	},
	progressBar: {
		position: "absolute",
		left: 16,
		right: 16,
		bottom: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: "rgba(246, 243, 241, 0.9)",
		borderRadius: 999,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderWidth: 1,
		borderColor: "rgba(179, 178, 175, 0.2)",
	},
	progressLabel: {
		fontSize: 10,
		fontWeight: "700",
		color: "#5f5f5d",
		width: 36,
	},
	progressTrack: {
		flex: 1,
		height: 4,
		borderRadius: 999,
		backgroundColor: "rgba(179, 178, 175, 0.3)",
		overflow: "hidden",
	},
	progressFill: {
		width: "45%",
		height: "100%",
		backgroundColor: "#8c4f3b",
	},
	progressActions: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
});

export default ChapterReadScreen;
