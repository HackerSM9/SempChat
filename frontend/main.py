# frontend/main.py

from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.lang import Builder

# Load KV file for styling
Builder.load_file('styles/app_style.kv')

class UserSetupScreen(Screen):
    pass  # Screen to handle user setup with username and PIN

class PartnerConnectionScreen(Screen):
    pass  # Screen to handle entering partner's username and PIN

class ChatScreen(Screen):
    pass  # Main chat screen

class SeChatApp(App):
    def build(self):
        sm = ScreenManager()
        sm.add_widget(UserSetupScreen(name='user_setup'))
        sm.add_widget(PartnerConnectionScreen(name='partner_connection'))
        sm.add_widget(ChatScreen(name='chat'))
        return sm

if __name__ == '__main__':
    SeChatApp().run()