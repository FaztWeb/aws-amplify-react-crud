import { useEffect, useState } from "react";
import {
  Authenticator,
  Button,
  Card,
  Flex,
  Grid,
  IconDelete,
  Text,
  TextField,
  useTheme,
  View,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { API, graphqlOperation } from "aws-amplify";
import { createTodo, deleteTodo, updateTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

function App() {
  const [task, setTask] = useState({
    title: "",
    description: "",
  });
  const [tasks, setTasks] = useState([]);
  const [id, setId] = useState("");
  const { tokens } = useTheme();

  const hasExistingTask = () => {
    if (id) {
      const isTask = tasks.findIndex((task) => task.id === id) > -1;
      return isTask;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasExistingTask()) {
      const result = await API.graphql(
        graphqlOperation(updateTodo, {
          input: { id, title: task.title, description: task.description },
        })
      );
      const updatedTask = result.data.updateTodo;
      const index = tasks.findIndex((task) => task.id === updatedTask.id);
      setTasks([
        ...tasks.slice(0, index),
        updatedTask,
        ...tasks.slice(index + 1),
      ]);
    } else {
      const result = await API.graphql(
        graphqlOperation(createTodo, {
          input: {
            title: task.title,
            description: task.description,
          },
        })
      );
      const newTask = result.data.createTodo;
      setTasks([...tasks, newTask]);
    }
    // clean data
    setTask({ title: "", description: "" });
    setId("");
  };

  const handleChange = ({ target: { name, value } }) => {
    setTask({
      ...task,
      [name]: value,
    });
  };

  const loadTasks = async () => {
    const result = await API.graphql(graphqlOperation(listTodos));
    setTasks(result.data.listTodos.items);
  };

  const handleDelete = async (id) => {
    const result = await API.graphql(
      graphqlOperation(deleteTodo, { input: { id } })
    );
    const deletedId = result.data.deleteTodo.id;
    setTasks(tasks.filter((task) => task.id !== deletedId));
  };

  const handleEdit = (task) => {
    setTask(task);
    setId(task.id);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <main>
          {/* <pre>
            {JSON.stringify(user, '', 2)}
          </pre> */}
          <Flex
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={tokens.colors.background.primary}
          >
            <Text fontSize="3rem" style={{ marginLeft: "2rem" }}>
              hello
            </Text>
            <Flex alignItems="center" style={{ marginRight: "2rem" }}>
              <Text fontSize="1.5rem">Hello {user.attributes.email}</Text>
              <Button onClick={signOut}>Sign out</Button>
            </Flex>
          </Flex>

          <Grid
            templateColumns="1fr 2fr"
            // templateRows="10rem 10rem"
            height="94vh"
            backgroundColor={tokens.colors.background.tertiary}
            padding={tokens.space.xxl}
          >
            <Card>
              <form onSubmit={handleSubmit}>
                <TextField
                  name="title"
                  placeholder="Title"
                  onChange={handleChange}
                  value={task.title}
                />

                <TextField
                  name="description"
                  rows="2"
                  placeholder="Description"
                  onChange={handleChange}
                  value={task.description}
                  isMultiline={true}
                />

                <Button variation="primary" type="submit">
                  {id ? "Update" : "Save"}
                </Button>
              </form>
            </Card>
            <View
              backgroundColor={tokens.colors.background.tertiary}
              padding={tokens.space.medium}
            >
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  onClick={() => handleEdit(task)}
                  variation="elevated"
                  width="100%"
                  style={{ marginBottom: "1rem", cursor: "pointer" }}
                >
                  
                  <div>
                    <h1>{task.title}</h1>
                    <p>{task.description}</p>
                  </div>
                  <Button
                    variation="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task.id);
                    }}
                  >
                    <IconDelete />
                    Delete
                  </Button>
                </Card>
              ))}
            </View>
          </Grid>
        </main>
      )}
    </Authenticator>
  );
}

export default App;
