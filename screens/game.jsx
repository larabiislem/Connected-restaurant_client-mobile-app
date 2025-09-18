"use client"

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  ActivityIndicator,
  Animated,
  Easing
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";



const { width, height } = Dimensions.get("window");
const wp = (size) => (width / 100) * size;
const hp = (size) => (height / 100) * size;

const DIFFICULTY_LEVELS = {
  easy: { pairs: 6, name: "Easy" },
  medium: { pairs: 8, name: "Medium" },
  hard: { pairs: 10, name: "Hard" }
};

const GameScreen = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [highScore, setHighScore] = useState(null);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS.easy);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const flipAnimations = useRef({});

  const navigation = useNavigation();

  const allSymbols = ['🍕', '🍔', '🍟', '🌭', '🍿', '🍣', '🍦', '🍩', '🍪', '🥗', '🍝', '🍤', '🥘', '🍜', '🍛', '🥟'];

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedHighScore = await AsyncStorage.getItem(`memoryGameHighScore_${difficulty.name}`);
        if (savedHighScore) setHighScore(JSON.parse(savedHighScore));
        initializeGame();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [difficulty]);

  const initializeGame = () => {
    const selectedSymbols = allSymbols.slice(0, difficulty.pairs);
    let gameCards = [];
    
    selectedSymbols.forEach((symbol, index) => {
      gameCards.push({ id: index * 2, symbol, flipped: false });
      gameCards.push({ id: index * 2 + 1, symbol, flipped: false });
    });

    gameCards = gameCards.sort(() => Math.random() - 0.5);
    
    gameCards.forEach(card => {
      flipAnimations.current[card.id] = new Animated.Value(0);
    });
    
    setCards(gameCards);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setTime(0);
    setGameOver(false);
    setTimerActive(true);
  };

  const flipCardAnimation = (cardId, toValue, callback) => {
    Animated.timing(flipAnimations.current[cardId], {
      toValue,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true
    }).start(callback);
  };

  const handleCardPress = (id) => {
    if (flipped.length === 2 || solved.includes(id) || flipped.includes(id)) return;

    flipCardAnimation(id, 1, () => {
      const newFlipped = [...flipped, id];
      setFlipped(newFlipped);

      const updatedCards = cards.map(card => 
        card.id === id ? { ...card, flipped: true } : card
      );
      setCards(updatedCards);

      if (newFlipped.length === 2) {
        setMoves(moves + 1);
        const [firstId, secondId] = newFlipped;
        const firstCard = cards.find(card => card.id === firstId);
        const secondCard = cards.find(card => card.id === secondId);

        if (firstCard.symbol === secondCard.symbol) {
          setSolved([...solved, firstId, secondId]);
          setFlipped([]);

          if (solved.length + 2 === cards.length) {
            setTimerActive(false);
            setGameOver(true);
            checkHighScore({ moves: moves + 1, time });
          }
        } else {
          setTimeout(() => {
            flipCardAnimation(firstId, 0);
            flipCardAnimation(secondId, 0);
            
            const resetCards = cards.map(card => 
              newFlipped.includes(card.id) ? { ...card, flipped: false } : card
            );
            setCards(resetCards);
            setFlipped([]);
          }, 1000);
        }
      }
    });
  };

  const checkHighScore = async (currentResult) => {
    const scoreData = {
      moves: currentResult.moves,
      time: currentResult.time,
      difficulty: difficulty.name
    };
    
    if (!highScore || currentResult.moves < highScore.moves || 
        (currentResult.moves === highScore.moves && currentResult.time < highScore.time)) {
      setHighScore(scoreData);
      try {
        await AsyncStorage.setItem(
          `memoryGameHighScore_${difficulty.name}`, 
          JSON.stringify(scoreData)
        );
      } catch (error) {
        console.error('Error saving high score:', error);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderCard = (card) => {
    const isFlipped = flipped.includes(card.id) || solved.includes(card.id);
    
    const rotateY = flipAnimations.current[card.id]?.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg']
    });
    
    return (
      <Animated.View 
        key={card.id.toString()}
        style={[styles.card, { transform: [{ rotateY }, { perspective: 1000 }] }]}
      >
        <View style={[styles.cardInner, isFlipped ? styles.cardFlipped : styles.cardBack]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => handleCardPress(card.id)}
            disabled={isFlipped}
          >
            <Text style={styles.cardText}>
              {isFlipped ? card.symbol : "?"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const changeDifficulty = (newDifficulty) => {
    setDifficulty(DIFFICULTY_LEVELS[newDifficulty]);
    initializeGame();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B0000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={wp(6)} color="#8B0000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Memory Game</Text>
          <View style={{ width: wp(10) }} />
        </View>

        <View style={styles.difficultyContainer}>
          {Object.keys(DIFFICULTY_LEVELS).map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                difficulty.name === DIFFICULTY_LEVELS[level].name && styles.selectedDifficulty
              ]}
              onPress={() => changeDifficulty(level)}
            >
              <Text style={styles.difficultyText}>{DIFFICULTY_LEVELS[level].name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.gameInfoContainer}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Moves</Text>
            <Text style={styles.infoValue}>{moves.toString()}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{formatTime(time)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>High Score</Text>
            <Text style={styles.infoValue}>
              {highScore ? `${highScore.moves} (${formatTime(highScore.time)})` : "-"}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={initializeGame}
          >
            <FontAwesome name="refresh" size={wp(4)} color="#8B0000" />
          </TouchableOpacity>
        </View>

        <View style={styles.gameBoard}>
          {cards.map(card => renderCard(card))}
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Play</Text>
          <Text style={styles.instructionsText}>
            Find all matching pairs of food emojis by flipping the cards.
            Try to complete the game with the fewest moves and fastest time!
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={gameOver}
        onRequestClose={() => setGameOver(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalText}>
              You completed the {difficulty.name} level in {moves.toString()} moves!
            </Text>
            <Text style={styles.modalText}>Time: {formatTime(time)}</Text>
            
            {highScore && (moves < highScore.moves || 
              (moves === highScore.moves && time < highScore.time)) && (
              <Text style={styles.highScoreText}>New High Score! 🎉</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setGameOver(false);
                  initializeGame();
                }}
              >
                <Text style={styles.modalButtonText}>Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setGameOver(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.modalButtonText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  scrollContainer: {
    paddingBottom: hp(5),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: hp(2.5),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: wp(1),
  },
  headerText: {
    fontFamily: "SFProDisplay-Bold",
    fontWeight: "700",
    fontSize: wp(6),
    color: '#8B0000',
    textAlign: "center",
    flex: 1,
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: hp(1),
  },
  difficultyButton: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    marginHorizontal: wp(1),
    borderRadius: wp(2),
    backgroundColor: "#E3F2FD",
  },
  selectedDifficulty: {
    backgroundColor: "#2196F3",
  },
  difficultyText: {
    color: "#333",
    fontWeight: "500",
  },
  gameInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: "#FFF8E1",
    marginHorizontal: wp(4),
    borderRadius: wp(3),
    marginTop: hp(1),
  },
  infoBox: {
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: wp(3.5),
    color: "#666",
    marginBottom: hp(0.5),
  },
  infoValue: {
    fontSize: wp(4),
    fontWeight: "bold",
    color: "#8B0000",
  },
  resetButton: {
    padding: wp(3),
    backgroundColor: "#FFC01D",
    borderRadius: wp(2),
  },
  gameBoard: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: wp(4),
    marginTop: hp(2),
  },
  card: {
    width: wp(20),
    height: wp(20),
    margin: wp(2),
  },
  cardInner: {
    width: '100%',
    height: '100%',
    borderRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  cardContent: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  cardBack: {
    backgroundColor: "#8B0000",
  },
  cardFlipped: {
    backgroundColor: "#FFF8E1",
  },
  cardText: {
    fontSize: wp(10),
  },
  instructionsContainer: {
    padding: wp(5),
    margin: wp(4),
    backgroundColor: "#E3F2FD",
    borderRadius: wp(3),
  },
  instructionsTitle: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: hp(1),
  },
  instructionsText: {
    fontSize: wp(3.8),
    color: "#333",
    lineHeight: hp(3),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    width: wp(80),
    borderRadius: wp(4),
    padding: wp(5),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: "bold",
    color: "#8B0000",
    marginBottom: hp(1),
  },
  modalText: {
    fontSize: wp(4),
    textAlign: "center",
    marginBottom: hp(1),
    color: "#333",
  },
  highScoreText: {
    fontSize: wp(4),
    color: "#FFC01D",
    fontWeight: "bold",
    marginBottom: hp(2),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: hp(2),
  },
  modalButton: {
    backgroundColor: "#8B0000",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    flex: 1,
    marginHorizontal: wp(1),
    alignItems: "center",
  },
  modalButtonSecondary: {
    backgroundColor: "#2196F3",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp(3.8),
    fontWeight: "500",
  },
});

export default GameScreen;