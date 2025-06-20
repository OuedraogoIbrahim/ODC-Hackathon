import { useTranslation } from "react-i18next";
import { Text } from "react-native";

export default function Favoris() {
  const { t } = useTranslation();
  return <Text>{t("favoris_screen_title")}</Text>;
}
