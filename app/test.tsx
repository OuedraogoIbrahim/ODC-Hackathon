import React from 'react';
import { View, Button, Text } from 'react-native';
import Voice from 'react-native-voice';
import * as Permissions from 'expo-permissions';

class VoiceRecognition extends React.Component {
constructor(props) {
super(props);
this.state = {
recognized: '',
pitch: '',
error: '',
end: '',
started: '',
results: [],
partialResults: [],
};
Voice.onSpeechStart = this.onSpeechStart.bind(this);
Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
Voice.onSpeechError = this.onSpeechError.bind(this);
Voice.onSpeechResults = this.onSpeechResults.bind(this);
Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
}

async componentDidMount() {
const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
if (status !== 'granted') {
alert('Permission to access microphone is required!');
}
}

onSpeechStart(e) {
this.setState({ started: '√' });
}

onSpeechRecognized(e) {
this.setState({ recognized: '√' });
}

onSpeechEnd(e) {
this.setState({ end: '√' });
}

onSpeechError(e) {
this.setState({ error: e.error });
}

onSpeechResults(e) {
this.setState({ results: e.value });
}

onSpeechPartialResults(e) {
this.setState({ partialResults: e.value });
}

startRecognizing() {
this.setState({ recognized: '', pitch: '', error: '', end: '', started: '', results: [], partialResults: [] });
Voice.start('en-US');
}

stopRecognizing() {
Voice.stop();
}

render() {
return (
<View>
<Button title="Start Recognizing" onPress={this.startRecognizing.bind(this)} />
<Button title="Stop Recognizing" onPress={this.stopRecognizing.bind(this)} />
<Text>{this.state.results.join(', ')}</Text>
</View>
);
}
}

export default VoiceRecognition;