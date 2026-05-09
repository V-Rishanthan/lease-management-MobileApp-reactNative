import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Sparkles, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ViewReceipt = () => {
    const navigation = useNavigation();
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReceipts = async () => {
            const { data, error } = await supabase.from('receipts').select('*');

            if (error) {
                console.error('Error fetching receipts:', error);
            } else {
                setReceipts(data ?? []);
            }

            setLoading(false);
        };

        fetchReceipts();
    }, []);

    const handleDelete = (id: string, imageUrl: string | null) => {
        Alert.alert(
            "Delete Receipt",
            "Are you sure you want to delete this receipt? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            // 1. Delete image from storage if it exists
                            if (imageUrl) {
                                // Extract the file name from the public URL
                                const urlParts = imageUrl.split('/');
                                const fileName = urlParts[urlParts.length - 1];

                                if (fileName) {
                                    // The file is uploaded with the format: receipts/[fileName]
                                    // But since we are deleting from the 'receipts' bucket, we might just need the fileName.
                                    // Let's verify the upload path. In recepts.tsx, it's:
                                    // const filePath = `receipts/${fileName}`; 
                                    // AND supabase.storage.from("receipts").upload(filePath, ...)
                                    // So the actual path inside the 'receipts' bucket is 'receipts/filename.jpg'.
                                    const filePath = `receipts/${fileName}`;

                                    const { error: storageError } = await supabase.storage
                                        .from('receipts')
                                        .remove([filePath]);

                                    if (storageError) {
                                        console.error('Error deleting image from storage:', storageError);
                                    } else {
                                        console.log('Successfully deleted image from storage:', filePath);
                                    }
                                }
                            }

                            // 2. Delete record from database
                            const { error: dbError } = await supabase
                                .from('receipts')
                                .delete()
                                .eq('id', id);

                            if (dbError) {
                                throw dbError;
                            }

                            // 3. Update UI
                            setReceipts(prev => prev.filter(r => r.id !== id));
                        } catch (error) {
                            console.error('Error deleting receipt:', error);
                            Alert.alert("Error", "Failed to delete receipt.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // ── Render Each Item ─────────────────────────────────────
    const renderItem = ({ item }: { item: any }) => (
        <View style={s.receiptCard}>
            {item.image ? (
                <Image source={{ uri: item.image }} style={s.receiptImage} />
            ) : (
                <View style={[s.receiptImage, { backgroundColor: '#eee' }]} />
            )}

            <View style={s.receiptInfo}>
                <Text style={s.receiptAmount}>
                    LKR {item.paid_amount?.toLocaleString() ?? '0.00'}
                </Text>

                {item.bank && (
                    <Text style={s.receiptBank}>{item.bank}</Text>
                )}

                {item.date && (
                    <Text style={s.receiptDate}>{item.date}</Text>
                )}
            </View>

            <TouchableOpacity
                style={s.deleteBtn}
                onPress={() => handleDelete(item.id, item.image)}
            >
                <Trash2 color={Colors.error} size={20} />
            </TouchableOpacity>
        </View>
    );

    // ── Header ──────────────────────────────────────────────
    const HeroHeader = () => (
        <LinearGradient
            colors={[Colors.primaryFade, Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
        >
            {/* Back Button */}
            <TouchableOpacity
                style={s.backBtn}
                onPress={() => navigation.goBack()}
            >
                <ArrowLeft color="#fff" size={22} />
            </TouchableOpacity>

            <View style={s.decCircle1} />
            <View style={s.decCircle2} />

            <View style={s.heroInner}>
                <View style={s.heroBadge}>
                    <Sparkles color={Colors.primaryFade} size={13} />
                    <Text style={s.heroBadgeText}>Transactions</Text>
                </View>

                <Text style={s.heroTitle}>Receipt History</Text>

                <Text style={s.heroSub}>
                    All your submitted receipts are listed below for quick access
                </Text>
            </View>
        </LinearGradient>
    );

    return (
        <SafeAreaView style={s.safe}>
            <StatusBar
                barStyle={'light-content'}
                backgroundColor={Colors.primary}
            />

            {loading ? (
                <>
                    <HeroHeader />
                    <ActivityIndicator
                        size="large"
                        color={Colors.primary}
                        style={{ marginTop: 30 }}
                    />
                </>
            ) : (
                <FlatList
                    data={receipts}
                    keyExtractor={(item, index) =>
                        item.id?.toString() ?? index.toString()
                    }
                    renderItem={renderItem}
                    ListHeaderComponent={<HeroHeader />}
                    ListEmptyComponent={
                        <View style={s.emptyState}>
                            <Text style={s.emptyStateText}>
                                No receipts found
                            </Text>
                        </View>
                    }
                    contentContainerStyle={s.scroll}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

export default ViewReceipt;

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    scroll: { paddingBottom: 60 },

    // Hero
    hero: {
        paddingTop: 56,
        paddingBottom: 32,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        marginBottom: 20,
    },
    heroInner: { zIndex: 2, marginBottom: 20 },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: Colors.white,
        alignSelf: 'flex-end',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginBottom: 14,
    },
    heroBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primaryFade,
        letterSpacing: 0.4,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.white,
        letterSpacing: -0.5,
        marginBottom: 6,
    },
    heroSub: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.70)',
        lineHeight: 19,
    },

    // Decorative circles
    decCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.06)',
        top: -50,
        right: -50,
    },
    decCircle2: {
        position: 'absolute',
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -30,
        right: 80,
    },

    // Receipt Card
    receiptCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    receiptImage: {
        width: 70,
        height: 70,
        borderRadius: 12,
        marginRight: 14,
    },
    receiptInfo: { flex: 1 },
    receiptAmount: {
        fontSize: 17,
        fontWeight: '800',
        color: Colors.textDark,
        marginBottom: 4,
    },
    receiptBank: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.textMid,
        marginBottom: 2,
    },
    receiptDate: {
        fontSize: 12,
        color: Colors.textMuted,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyStateText: {
        fontSize: 14,
        color: Colors.textMuted,
    },


    // Back Button
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 3,
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 8,
        borderRadius: 20,
    },

    // Delete Button
    deleteBtn: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});