import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeTodos = async (todos) => {
  try {
    await AsyncStorage.setItem('TODOS', JSON.stringify(todos));
  } catch (e) {
    console.error("Saving error", e);
  }
};

export const getTodos = async () => {
  try {
    const json = await AsyncStorage.getItem('TODOS');
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error("Loading error", e);
    return [];
  }
};
