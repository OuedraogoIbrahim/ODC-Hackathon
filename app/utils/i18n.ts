import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from "../../locales/en/translation.json";
import fr from "../../locales/fr/translation.json";

import AsyncStorage from "@react-native-async-storage/async-storage";

const  STORE_LANGUAGE_KEY = "language" ; 

const languageDetectorPlugin = { 
    type : "languageDetector" , 
    async : true , 
    init : () => { }, 
    detect : async  function ( callback: (lang: string) => void ) { 
        try { 
            // récupérer la langue stockée depuis le stockage Async 
            // mettre votre propre logique de détection de langue ici 
            await  AsyncStorage.getItem ( STORE_LANGUAGE_KEY ). then ( ( language ) => { 
                if (language) { 
                    return  callback (language); 
                } else { 
                    //si la langue n'a pas encore été stockée, utilisez l'anglais 
                    return  callback ( "fr" ); 
                } 
            }); 
        } catch (error) { 
            console . log ( "Erreur de lecture de la langue" + error); 
        } 
    }, 
    cacheUserLanguage : async  function ( language: string ) { 
        try { 
            //enregistre le choix de langue d'un utilisateur dans le stockage asynchrone 
            await  AsyncStorage . setItem ( STORE_LANGUAGE_KEY , language); 
        } catch (error) { } 
    }, 
}; 
const resources = { 
    en : { 
        translation : en, 
    }, 
    fr : { 
        translation : fr, 
    }, 
}; 

i18n. use (initReactI18next). use (languageDetectorPlugin). init ({ 
    resources, 
    compatibilityJSON : 'v3', 
    // la langue de secours est définie sur l'anglais 
    fallbackLng : "en" , 
    interpolation : { 
        escapeValue : false , 
    }, 
}); 
export  default i18n;
