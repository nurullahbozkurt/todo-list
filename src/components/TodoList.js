import React from "react";
import axios from "axios";
import { format } from "date-fns";
import { TiTick } from "react-icons/ti";
import { FiEdit } from "react-icons/fi";
import { useMutation } from "react-query";
import { BsFlagFill } from "react-icons/bs";
import { MdDeleteOutline } from "react-icons/md";

import Loading from "./Loading";
import { useApp } from "../states/app";
import useGetTodos from "../hooks/useGetTodos";
import { DEFAULT_TODO } from "../statics/DEFAULT_TODO";

const TodoList = ({ task }) => {
  const {
    addTask,
    setAddTask,
    setEditTask,
    setActiveAddTodo,
    setEditModalShow,
  } = useApp();

  const { refetch, isLoading } = useGetTodos();

  // Edit button click function to open edit modal and set edit todo state to current todo
  const editButtonHandler = async (task) => {
    await setEditTask(task);
    setAddTask(task);
    setEditModalShow(true);
  };

  // A request to complete the todo is sent to the server
  const requestComletedTodo = useMutation(() => {
    return axios.put(
      `https://63132301b466aa9b03939063.mockapi.io/api/todos/${task?.id}`,
      addTask
    );
  });

  // This function is used to complete the todo
  const handleCompetedTodo = async () => {
    setActiveAddTodo(false);
    await setAddTask({
      ...addTask,
      ...task,
      isCompleted: !task.isCompleted,
    });
    await requestComletedTodo.mutateAsync();
    refetch();
    setAddTask(DEFAULT_TODO);
  };

  // A request is sent to the server to delete a to-do
  const requestDeleteTodo = useMutation(() => {
    return axios.delete(
      `https://63132301b466aa9b03939063.mockapi.io/api/todos/${task?.id}`
    );
  });

  // Delete todo function is called when the delete button is clicked on the to-do list
  const deleteTodo = async () => {
    await requestDeleteTodo.mutateAsync();
    refetch();
  };

  if (isLoading) return <Loading />;
  return (
    <>
      <div className="py-1">
        <div className="border-y flex flex-col gap-1 py-1">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCompetedTodo}
              className="group flex items-center gap-2"
            >
              <div
                className={`group-hover:text-gray-900 text-gray-300 border rounded-full `}
              >
                <TiTick />
              </div>
              <p
                className={`${
                  task.isCompleted ? "line-through " : "group-hover:underline "
                } font-semibold text-sm md:text-base`}
              >
                {task.title}
              </p>
            </button>
            <div className="flex items-center gap-3">
              {(requestDeleteTodo.isLoading ||
                requestComletedTodo.isLoading) && (
                <div>
                  <Loading />
                </div>
              )}
              <button
                onClick={deleteTodo}
                className="text-gray-600 hover:text-gray-900 dark:text-slate-300 hover:dark:text-slate-400 text-xl"
              >
                <MdDeleteOutline />
              </button>
              {!task.isCompleted && (
                <button
                  onClick={() => editButtonHandler(task)}
                  className="text-gray-600 hover:text-gray-900 dark:text-slate-300 hover:dark:text-slate-400"
                >
                  <FiEdit />
                </button>
              )}

              {task.priority === "high" && (
                <div className="text-red-700">
                  <BsFlagFill />
                </div>
              )}
              {task.priority === "medium" && (
                <div className="text-yellow-500">
                  <BsFlagFill />
                </div>
              )}
              {task.priority === "low" && (
                <div className="text-blue-500">
                  <BsFlagFill />
                </div>
              )}
              {task.priority === "none" && (
                <div className="text-gray-500">
                  <BsFlagFill />
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pl-7 text-xs md:text-sm">
            <p>{task.content}</p>
            <div>
              <p className="text-center">
                {task.deadline && format(new Date(task.deadline), "PP")}
              </p>
              <p className="text-center">
                {!task.deadline && format(new Date(task.createdAt), "PP")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TodoList;
