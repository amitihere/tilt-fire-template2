import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, Text,TouchableWithoutFeedback, TouchableOpacity} from "react-native";
import { Accelerometer } from 'expo-sensors';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;

const BLOCK_WIDTH = 40;
const BLOCK_HEIGHT = 40;
const PLAYER_Y = screenHeight - PLAYER_HEIGHT - 20;

export default function App() {
  const [playerX, setPlayerX] = useState((screenWidth - PLAYER_WIDTH) / 2);
  const [block,setBlock] = useState([])
  const [game, setGame] = useState(false);
  const [count,setCount] = useState(0)

  useEffect(()=>{
    Accelerometer.setUpdateInterval(95)
    const subscription = Accelerometer.addListener(({x})=>{
      let move = x * 70
      let allowedWidth = playerX + move
      if (allowedWidth >=0 && allowedWidth < screenWidth-PLAYER_WIDTH){
        setPlayerX(allowedWidth)
      }
    })
    return () => subscription.remove()
  },[playerX])

  useEffect(()=>{
    const inter = setInterval(()=>{
      setBlock(prev=>prev.map((b)=> ({...b, y:b.y + 5})))
    },90)
    return ()=>clearInterval(inter)
  },[])

  const handleBlock = () => {
    const block = {
      id:Date.now(),
      x: Math.random() * (screenWidth - PLAYER_WIDTH),
      y: 0
    }
    setBlock(prev=> [...prev,block])
  }

  useEffect(()=>{
     const id =  setInterval(()=>{
      handleBlock()
    },1500)

    return ()=> clearInterval(id)
  },[])

  const rules = (playerX, blocks) => {
    return (
      playerX < blocks.x + BLOCK_WIDTH &&
      playerX + PLAYER_WIDTH > blocks.x &&
      PLAYER_Y < blocks.y + BLOCK_HEIGHT &&
      PLAYER_Y + PLAYER_HEIGHT > blocks.y
    );
  };

  useEffect(() => {
    let newBlocks = [];
    let gained = 0;
    let changed = false;

    block.forEach((b) => {
      if (rules(playerX, b)) {
        setGame(true);
        return;
      }

      if (b.y > screenHeight) {
        gained++;
        changed = true;
        return;
      }

      newBlocks.push(b);
    });

    if (changed) {
      setBlock(newBlocks);
    }

    if (gained > 0) {
      setCount(c => c + gained);
    }

  }, [block, playerX]);

  return (
    <TouchableWithoutFeedback>
      {game ? (
        <View style={[styles.container,{alignItems:'center',justifyContent:'center'}]}>
          <Text style={{color:'white',fontSize:30}}>Game Over</Text>
          <TouchableOpacity 
            onPress={()=> {
              setGame(false)
              setBlock([])
              setCount(0)
            }}
            style={styles.newGame}>
            <Text>New game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <Text style={[styles.instruction,{color:'white',fontSize:25,alignSelf:'flex-start',marginTop:30}]}>Score : {count}</Text>
          {block.map((b, index) => (
            <View style={[styles.fallingBlock, { left: b.x, top: b.y }]} key={index} />
          ))}
          <View style={[styles.player, { left: playerX }]} />
          <Text style={styles.instruction}>Tilt your phone to move</Text>
        </View>
      )}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  player: {
    position: "absolute",
    bottom: 20,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    backgroundColor: "#a4ac0cff",
    borderWidth: 2,
    borderColor: "#000",
  },
  instruction: {
    position: "absolute",
    top: 70,
    color: "#fff",
    fontFamily: "Courier",
    fontSize: 14,
  },
  fallingBlock: {
    position: "absolute",
    width: BLOCK_WIDTH,
    height: BLOCK_HEIGHT,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "black",
  },
  newGame: {
    width:105,
    height:30,
    backgroundColor:'white',
    borderRadius:10,
    alignItems:'center',
    justifyContent:'center'
  }
});
