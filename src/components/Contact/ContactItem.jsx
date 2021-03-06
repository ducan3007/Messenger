import React, { useState,memo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Context, useContext } from "../../Context/ContextProvider";

import { Ionicons, Fontisto } from "@expo/vector-icons";
import { theme } from "../../theme";
import { db, doc, setDoc, getDoc } from "../../../firebase";

const ContactItem = ({ username, photoURL, id, email, state,appstate }) => {
  const { User, setCallee } = useContext(Context);

  const navigation = useNavigation();

  const createRoomChat = async () => {
    try {
      let roomId;

      let roomId_1 = `${User.email}${email}`;
      let roomId_2 = `${email}${User.email}`;

      const roomRef_1 = doc(db, "rooms", roomId_1);
      const roomRef_2 = doc(db, "rooms", roomId_2);
      const docSnap_1 = await getDoc(roomRef_1);
      const docSnap_2 = await getDoc(roomRef_2);

      if (!docSnap_1.exists() && !docSnap_2.exists()) {
        roomId = roomId_1;
      } else if (!docSnap_1.exists() && docSnap_2.exists()) {
        roomId = roomId_2;
      } else if (docSnap_1.exists() && !docSnap_2.exists()) {
        roomId = roomId_1;
      }

      const roomRef = doc(db, "rooms", roomId);

      const roomInfo = {
        id: roomId,
        users: [email, User.email],
        roomName: "",
      };
      roomInfo[`${User.email}`] = {
        username: User.username,
        email: User.email,
        photoURL: User.photoURL,
      };
      roomInfo[`${email}`] = {
        username: username,
        email: email,
        photoURL: photoURL,
      };

      await setDoc(roomRef, roomInfo, { merge: true });

      navigation.navigate("MessagesScreen", {
        userId: id,
        id: roomId,
        username: username,
        email: email,
        photoURL: photoURL,
        state: state,
        appstate:appstate
      });
      
    } catch (error) {
      console.log(error);
    }
  };
  const startCall = async () => {
    const callerRef = doc(db, "users", User.id);
    setCallee({ id: id, email: email, username: username, photoURL: photoURL });
    await setDoc(callerRef, { callState: "caller", callRoom: `${User.email}${email}` }, { merge: true });
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image style={styles.image} source={{ uri: photoURL }} />
        {state === "online" && <View style={[styles.activity, styles.status]} />}
      </View>

      <View style={styles.usernameAndCall}>
        <View style={styles.usernameAndStatus}>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={createRoomChat} style={{ alignSelf: "center", paddingRight: 30 }}>
            <Ionicons name="chatbox" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={startCall} style={{ alignSelf: "center" }}>
            <Fontisto name="phone" size={25} color={theme.colors.pink} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 25,
    paddingRight: 20,
    paddingLeft: 10,
    flexDirection: "row",
  },
  imageContainer: {
    borderRadius: 25,
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderColor: "#edfcfc",
    borderWidth: 1,
  },
  usernameAndCall: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
    alignItems: "center",
  },
  usernameAndStatus: {
    paddingHorizontal: 13,
    marginTop: -5,
  },
  username: {
    color: "rgba(0, 95, 161,0.9)",
    fontSize: theme.fontSize.title,
    fontWeight: "bold",
  },

  iconStyle: {
    alignSelf: "center",
  },
  time: {
    color: theme.colors.description,
    paddingHorizontal: 5,
  },
  activity: {
    backgroundColor: "#27AE60",
    position: "absolute",
    alignSelf: "flex-end",
    borderColor: "white",
    borderWidth: 2,
  },
  status: {
    width: 20,
    height: 20,
    borderRadius: 15,
    bottom: -1,
    right: 1,
  },
});

export default memo(ContactItem);
