// Gesture handler must be imported before anything else so the drawer's gestures
// register correctly on native.
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
