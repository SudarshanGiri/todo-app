import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, Animated, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  // Load todos from storage on app start
  useEffect(() => {
    loadTodos();
  }, []);

  // Save todos to storage whenever they change
  useEffect(() => {
    saveTodos();
  }, [todos]);

  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos) {
        setTodos(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Failed to load todos', error);
    }
  };

  const saveTodos = async () => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
      console.error('Failed to save todos', error);
    }
  };

  const addTodo = () => {
    if (text.trim()) {
      const newTodo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setText('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEdit = (id, currentText) => {
    setEditId(id);
    setEditText(currentText);
  };

  const saveEdit = () => {
    setTodos(
      todos.map((todo) =>
        todo.id === editId ? { ...todo, text: editText } : todo
      )
    );
    setEditId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const remainingCount = todos.filter((todo) => !todo.completed).length;

  const theme = {
    colors: {
      background: darkMode ? '#121212' : '#ffffff',
      text: darkMode ? '#ffffff' : '#000000',
      card: darkMode ? '#1e1e1e' : '#f5f5f5',
      border: darkMode ? '#333333' : '#dddddd',
      primary: '#6200ee',
    },
  };

  const renderTodo = ({ item }) => {
    const scaleValue = new Animated.Value(1);

    const animateDelete = () => {
      Animated.timing(scaleValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => deleteTodo(item.id));
    };

    return (
      <Animated.View
        style={[
          styles.todoItem,
          { backgroundColor: theme.colors.card },
          { transform: [{ scale: scaleValue }] },
        ]}
      >
        {editId === item.id ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              theme={{ colors: { text: theme.colors.text } }}
            />
            <Button onPress={saveEdit}>Save</Button>
            <Button onPress={cancelEdit}>Cancel</Button>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => toggleTodo(item.id)}>
              <Icon
                name={item.completed ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={item.completed ? theme.colors.primary : theme.colors.text}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.todoText,
                {
                  color: theme.colors.text,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                },
              ]}
            >
              {item.text}
            </Text>
            <View style={styles.todoActions}>
              <TouchableOpacity onPress={() => startEdit(item.id, item.text)}>
                <Icon name="edit" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={animateDelete}>
                <Icon name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: theme.colors.background }}>
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Todo App
        </Text>
        <View style={styles.themeToggle}>
          <Icon
            name={darkMode ? 'nights-stay' : 'wb-sunny'}
            size={24}
            color={theme.colors.text}
          />
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            color={theme.colors.primary}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
      <TextInput
  mode="flat" // or "outlined"
  style={{
    flex: 1,
  }}
  placeholder="Add a new todosss..."
  value={text}
  onChangeText={setText}
  underlineColor="transparent" // hides default underline
  activeUnderlineColor={theme.colors.primary} // active state color
/>
        <Button
          mode="contained"
          onPress={addTodo}
          style={styles.addButton}
          color={theme.colors.primary}
        >
          Add
        </Button>
      </View>

      <View style={styles.filterContainer}>
        <Button
          mode={filter === 'all' ? 'contained' : 'outlined'}
          onPress={() => setFilter('all')}
          color={theme.colors.primary}
        >
          All
        </Button>
        <Button
          mode={filter === 'active' ? 'contained' : 'outlined'}
          onPress={() => setFilter('active')}
          color={theme.colors.primary}
        >
          Active
        </Button>
        <Button
          mode={filter === 'completed' ? 'contained' : 'outlined'}
          onPress={() => setFilter('completed')}
          color={theme.colors.primary}
        >
          Completed
        </Button>
      </View>

      <FlatList
        data={filteredTodos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id}
        style={styles.todoList}
      />

      <View style={styles.footer}>
        <Text style={{ color: theme.colors.text }}>
          {remainingCount} {remainingCount === 1 ? 'item' : 'items'} left
        </Text>
        <Button onPress={clearCompleted} color="#ff4444">
          Clear Completed
        </Button>
      </View>
    </View>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'transparent',
  },
  addButton: {
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  todoList: {
    flex: 1,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    elevation: 2,
  },
  todoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  todoActions: {
    flexDirection: 'row',
    gap: 15,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});

export default App;