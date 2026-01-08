import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.todolist',
  appName: 'todoList',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
