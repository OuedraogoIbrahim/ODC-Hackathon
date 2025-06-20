import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Animated,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Appbar, Text } from "react-native-paper";
import { AuthContext } from "../context/AuthContext";
import i18n from "../utils/i18n"; // Assurez-vous que i18n est correctement exporté depuis utils/i18n

const Colors = {
  black: "#242424",
  white: "#eee",
  primary: "#f97316", // Orange
};

const TabArr = (t) => [
  {
    route: "listeReservation",
    label: t("tab_layout_reservations_label"),
    icon: "list-circle-outline",
  },
  {
    route: "mesReservations",
    label: t("tab_layout_my_reservations_label"),
    icon: "calendar-outline",
  },
  {
    route: "favoris",
    label: t("tab_layout_favorites_label"),
    icon: "heart-circle-outline",
  },
];

const animateFocused = {
  0: { scale: 0.5, translateY: 7 },
  0.8: { translateY: -24 },
  1: { scale: 1.1, translateY: -14 },
};

const animateUnfocused = {
  0: { scale: 1.1, translateY: -14 },
  1: { scale: 1, translateY: 7 },
};

const circleExpand = {
  0: { scale: 0 },
  1: { scale: 1 },
};

const circleCollapse = {
  0: { scale: 1 },
  1: { scale: 0 },
};

const TabButton = ({ item, onPress }) => {
  const pathname = usePathname();
  const focused = pathname.includes(item.route);
  const viewRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animateFocused, 800);
      circleRef.current?.animate(circleExpand, 800);
      textRef.current?.transitionTo({ scale: 1, opacity: 1 }, 800);
    } else {
      viewRef.current?.animate(animateUnfocused, 800);
      circleRef.current?.animate(circleCollapse, 800);
      textRef.current?.transitionTo({ scale: 0, opacity: 0 }, 800);
    }
  }, [focused]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={1}
      style={styles.container}
    >
      <Animatable.View ref={viewRef} duration={800} style={styles.container}>
        <View
          style={[
            styles.btn,
            { backgroundColor: focused ? Colors.primary : Colors.white },
          ]}
        >
          <Animatable.View
            ref={circleRef}
            style={[
              styles.circle,
              {
                shadowColor: Colors.black,
                shadowOffset: { width: 2, height: -8 },
                shadowOpacity: 1,
                shadowRadius: 10,
                elevation: 5,
              },
            ]}
          />
          <Ionicons
            name={item.icon}
            size={24}
            color={focused ? Colors.white : Colors.black}
          />
        </View>
        <Animatable.Text
          ref={textRef}
          style={[
            styles.text,
            { color: focused ? Colors.primary : Colors.black },
          ]}
        >
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

export default function TabLayout() {
  const { t } = useTranslation();
  const navigation = useRouter();
  const pathname = usePathname();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { telephne, setTelephone, setIsConnected } = useContext(AuthContext);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLanguageMenuVisible, setIsLanguageMenuVisible] = useState(false);

  const handleMenuToggle = () => {
    if (isMenuVisible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsMenuVisible(false);
        setIsLanguageMenuVisible(false);
      });
    } else {
      setIsMenuVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLogoutPress = async () => {
    setIsMenuVisible(false);
    setLoading(true);

    try {
      await AsyncStorage.removeItem("telephne");
      setTelephone("");
      setIsConnected(false);

      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          t("tab_layout_success_title"),
          t("tab_layout_logout_success")
        );
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
      Alert.alert(t("tab_layout_error_title"), t("tab_layout_logout_error"));
    }
  };

  const savePhoneNumber = async () => {
    try {
      await AsyncStorage.setItem("telephne", JSON.stringify(inputValue));
      setTelephone(inputValue);
      setIsConnected(true);
      setInputVisible(false);
      Alert.alert(
        t("tab_layout_success_title"),
        t("tab_layout_save_phone_success")
      );
    } catch (error) {
      Alert.alert(
        t("tab_layout_error_title"),
        t("tab_layout_save_phone_error")
      );
    }
  };

  const handleLanguageChange = async (language) => {
    setIsMenuVisible(false);
    setIsLanguageMenuVisible(false);
    setLoading(true);

    try {
      await AsyncStorage.setItem("language", language);
      await i18n.changeLanguage(language);
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          t("tab_layout_success_title"),
          t("tab_layout_change_language_success")
        );
      }, 1000);
    } catch (error) {
      console.log(error);
      setLoading(false);
      Alert.alert(
        t("tab_layout_error_title"),
        t("tab_layout_change_language_error")
      );
    }
  };

  return (
    <>
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
          }}
        >
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ marginTop: 10, color: Colors.black }}>
            {t("tab_layout_loading")}
          </Text>
        </View>
      )}

      {!loading && (
        <Tabs
          screenOptions={{
            tabBarStyle: styles.tabBar,
            headerShown: true,
            headerStyle: {
              backgroundColor: Colors.white,
            },
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("/accueil")}
                style={{ marginLeft: 16 }}
              >
                <Ionicons name="home-outline" size={24} color={Colors.black} />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={styles.headerRightContainer}>
                <Appbar.Action
                  icon="cog"
                  onPress={handleMenuToggle}
                  color={Colors.black}
                />
                {isMenuVisible && (
                  <Animated.View style={[styles.menu, { opacity: fadeAnim }]}>
                    {telephne ? (
                      <TouchableOpacity style={styles.menuItem} disabled>
                        <Ionicons
                          name="lock-closed-outline"
                          size={24}
                          color={Colors.black}
                        />
                        <Text style={styles.menuText}>{telephne}</Text>
                      </TouchableOpacity>
                    ) : (
                      <>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => setInputVisible(true)}
                        >
                          <Ionicons
                            name="lock-open-outline"
                            size={24}
                            color={Colors.black}
                          />
                          <Text style={styles.menuText}>
                            {t("tab_layout_link_phone")}
                          </Text>
                        </TouchableOpacity>
                        {inputVisible && (
                          <View style={{ padding: 10 }}>
                            <TextInput
                              placeholder={t("tab_layout_phone_placeholder")}
                              value={inputValue}
                              onChangeText={setInputValue}
                              keyboardType="phone-pad"
                              style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 5,
                                padding: 8,
                                marginBottom: 5,
                              }}
                            />
                            <TouchableOpacity
                              onPress={savePhoneNumber}
                              style={{
                                backgroundColor: Colors.primary,
                                padding: 8,
                                borderRadius: 5,
                              }}
                            >
                              <Text
                                style={{ color: "#fff", textAlign: "center" }}
                              >
                                {t("tab_layout_save_button")}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleLogoutPress}
                    >
                      <Ionicons
                        name="log-out-outline"
                        size={24}
                        color={Colors.black}
                      />
                      <Text style={styles.menuText}>
                        {t("tab_layout_logout_button")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() =>
                        setIsLanguageMenuVisible(!isLanguageMenuVisible)
                      }
                    >
                      <Ionicons
                        name="language-outline"
                        size={24}
                        color={Colors.black}
                      />
                      <Text style={styles.menuText}>
                        {t("tab_layout_change_language")}
                      </Text>
                    </TouchableOpacity>
                    {isLanguageMenuVisible && (
                      <View style={{ paddingLeft: 20 }}>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleLanguageChange("fr")}
                        >
                          <Text style={styles.menuText}>
                            🇫🇷 {t("tab_layout_language_fr")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.menuItem}
                          onPress={() => handleLanguageChange("en")}
                        >
                          <Text style={styles.menuText}>
                            🇬🇧 {t("tab_layout_language_en")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Animated.View>
                )}
              </View>
            ),
          }}
        >
          {TabArr(t).map((item, index) => (
            <Tabs.Screen
              key={index}
              name={item.route}
              options={{
                tabBarShowLabel: false,
                title: "",
                tabBarButton: (props) => <TabButton {...props} item={item} />,
              }}
            />
          ))}
        </Tabs>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 70,
  },
  tabBar: {
    height: 70,
    marginTop: 18,
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.black,
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 25,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0,
    transform: [{ translateY: 20 }],
  },
  headerRightContainer: {
    position: "relative",
    marginRight: 16,
  },
  menu: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.black,
  },
});
